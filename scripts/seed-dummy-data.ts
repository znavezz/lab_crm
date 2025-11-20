import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Deleting all non-member data...')

  // Delete in order to respect foreign key constraints
  await prisma.noteTask.deleteMany({})
  await prisma.booking.deleteMany({})
  await prisma.expense.deleteMany({})
  await prisma.document.deleteMany({})
  await prisma.academicInfo.deleteMany({})
  
  // Delete M:N relations first
  await prisma.$executeRawUnsafe(`
    DELETE FROM "_EventToEquipment";
    DELETE FROM "_EventToMember";
    DELETE FROM "_EventToProject";
    DELETE FROM "_ProjectMembers";
    DELETE FROM "_ProjectToGrant";
    DELETE FROM "_ProjectToPublication";
    DELETE FROM "_ProjectToCollaborator";
    DELETE FROM "_MemberToPublication";
  `).catch(() => {}) // Ignore if tables don't exist

  await prisma.equipment.deleteMany({})
  await prisma.event.deleteMany({})
  await prisma.publication.deleteMany({})
  await prisma.collaborator.deleteMany({})
  await prisma.grant.deleteMany({})
  await prisma.project.deleteMany({})

  console.log('✅ Deleted all non-member data')

  // Get all members
  const members = await prisma.member.findMany()
  if (members.length === 0) {
    console.log('⚠️  No members found. Please seed members first.')
    return
  }

  console.log(`📊 Found ${members.length} members`)

  // Create AcademicInfo for some members
  console.log('📚 Creating academic info...')
  const academicDegrees = [
    { degree: 'BSc', field: 'Biology', institution: 'Tel Aviv University', graduationYear: 2018 },
    { degree: 'MSc', field: 'Bioinformatics', institution: 'Tel Aviv University', graduationYear: 2020 },
    { degree: 'PhD', field: 'Computational Biology', institution: 'Weizmann Institute', graduationYear: 2024 },
    { degree: 'BSc', field: 'Chemistry', institution: 'Hebrew University', graduationYear: 2019 },
    { degree: 'MSc', field: 'Biochemistry', institution: 'Technion', graduationYear: 2021 },
  ]

  for (let i = 0; i < Math.min(members.length, 5); i++) {
    const degree = academicDegrees[i % academicDegrees.length]
    await prisma.academicInfo.create({
      data: {
        ...degree,
        memberId: members[i].id,
      },
    })
  }

  // Create Projects
  console.log('🔬 Creating projects...')
  const projectTitles = [
    'Genome Sequencing Analysis',
    'Protein Structure Prediction',
    'Drug Discovery Pipeline',
    'CRISPR Gene Editing',
    'Machine Learning for Genomics',
    'Cancer Biomarker Research',
    'Stem Cell Differentiation',
  ]

  const projects = []
  for (let i = 0; i < projectTitles.length; i++) {
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - (i * 2))
    const endDate = new Date(startDate)
    endDate.setFullYear(endDate.getFullYear() + 2)

    const project = await prisma.project.create({
      data: {
        title: projectTitles[i],
        description: `Research project focusing on ${projectTitles[i].toLowerCase()}. This project involves multiple team members and aims to advance our understanding in this field.`,
        startDate,
        endDate: i < 3 ? endDate : null, // Some projects are ongoing
      },
    })
    projects.push(project)
  }

  // Link members to projects (M:N)
  console.log('👥 Linking members to projects...')
  for (const project of projects) {
    const numMembers = Math.floor(Math.random() * 3) + 2 // 2-4 members per project
    const selectedMembers = members
      .sort(() => Math.random() - 0.5)
      .slice(0, numMembers)
    
    await prisma.project.update({
      where: { id: project.id },
      data: {
        members: {
          connect: selectedMembers.map(m => ({ id: m.id })),
        },
      },
    })
  }

  // Create Grants
  console.log('💰 Creating grants...')
  const grantNames = [
    'NSF Research Grant 2024',
    'NIH Biomedical Research Fund',
    'ERC Starting Grant',
    'Israel Science Foundation Grant',
  ]

  const grants = []
  for (let i = 0; i < grantNames.length; i++) {
    const deadline = new Date()
    deadline.setFullYear(deadline.getFullYear() + 1 + i)

    const grant = await prisma.grant.create({
      data: {
        name: grantNames[i],
        budget: (Math.random() * 500000 + 100000), // $100k - $600k
        deadline,
      },
    })
    grants.push(grant)
  }

  // Link grants to projects (M:N)
  console.log('🔗 Linking grants to projects...')
  for (let i = 0; i < projects.length; i++) {
    const numGrants = Math.floor(Math.random() * 2) + 1 // 1-2 grants per project
    const selectedGrants = grants
      .sort(() => Math.random() - 0.5)
      .slice(0, numGrants)
    
    await prisma.project.update({
      where: { id: projects[i].id },
      data: {
        grants: {
          connect: selectedGrants.map(g => ({ id: g.id })),
        },
      },
    })
  }

  // Create Equipment
  console.log('🔧 Creating equipment...')
  const equipmentItems = [
    { name: 'PCR Machine', description: 'Thermal cycler for DNA amplification', status: 'AVAILABLE' as const },
    { name: 'Centrifuge', description: 'High-speed centrifuge for sample processing', status: 'IN_USE' as const },
    { name: 'Microscope', description: 'Confocal microscope for cell imaging', status: 'AVAILABLE' as const },
    { name: 'Laptop - Dell XPS', description: 'Development laptop for bioinformatics', status: 'IN_USE' as const },
    { name: 'Sequencer', description: 'Next-generation DNA sequencer', status: 'MAINTENANCE' as const },
    { name: 'Incubator', description: 'CO2 incubator for cell culture', status: 'AVAILABLE' as const },
    { name: 'Freezer -80°C', description: 'Ultra-low temperature freezer', status: 'AVAILABLE' as const },
    { name: 'Flow Cytometer', description: 'Cell analysis and sorting', status: 'IN_USE' as const },
  ]

  const equipments = []
  for (let i = 0; i < equipmentItems.length; i++) {
    const item = equipmentItems[i]
    const equipment = await prisma.equipment.create({
      data: {
        name: item.name,
        description: item.description,
        status: item.status,
        serialNumber: `SN-${Date.now()}-${i}`,
        // Assign some equipment to members, some to projects, some to neither
        memberId: i < 2 ? members[i % members.length].id : null,
        projectId: i >= 2 && i < 4 ? projects[i - 2].id : null,
      },
    })
    equipments.push(equipment)
  }

  // Create Publications
  console.log('📄 Creating publications...')
  const publicationTitles = [
    'Machine Learning Approaches to Protein Folding Prediction',
    'CRISPR-Cas9 Editing in Stem Cell Research',
    'Genomic Analysis of Cancer Biomarkers',
    'Computational Methods for Drug Discovery',
    'Single-Cell RNA Sequencing: Advances and Applications',
    'Network Analysis of Protein-Protein Interactions',
  ]

  const publications = []
  for (let i = 0; i < publicationTitles.length; i++) {
    const publishedDate = new Date()
    publishedDate.setMonth(publishedDate.getMonth() - (i * 3))

    const publication = await prisma.publication.create({
      data: {
        title: publicationTitles[i],
        published: publishedDate,
        doi: `10.1234/journal.${2024 - i}.${String(i + 1).padStart(4, '0')}`,
        url: `https://example.com/publications/${i + 1}`,
      },
    })
    publications.push(publication)
  }

  // Link publications to members and projects (M:N)
  console.log('🔗 Linking publications to members and projects...')
  for (let i = 0; i < publications.length; i++) {
    const numMembers = Math.floor(Math.random() * 3) + 2 // 2-4 authors
    const selectedMembers = members
      .sort(() => Math.random() - 0.5)
      .slice(0, numMembers)
    
    await prisma.publication.update({
      where: { id: publications[i].id },
      data: {
        members: {
          connect: selectedMembers.map(m => ({ id: m.id })),
        },
        projects: {
          connect: i < projects.length ? [{ id: projects[i].id }] : [],
        },
      },
    })
  }

  // Create Events
  console.log('📅 Creating events...')
  const eventTitles = [
    'Weekly Lab Meeting',
    'Journal Club: Recent Advances in Genomics',
    'Guest Speaker: Dr. Jane Smith',
    'Lab Retreat 2024',
    'Training Session: CRISPR Techniques',
    'Conference: Bioinformatics Summit',
  ]

  const events = []
  for (let i = 0; i < eventTitles.length; i++) {
    const eventDate = new Date()
    eventDate.setDate(eventDate.getDate() + (i * 7)) // One week apart

    const event = await prisma.event.create({
      data: {
        title: eventTitles[i],
        description: `Event: ${eventTitles[i]}`,
        date: eventDate,
        location: i % 2 === 0 ? 'Lab Conference Room' : 'Main Auditorium',
      },
    })
    events.push(event)
  }

  // Link events to members and projects (M:N)
  console.log('🔗 Linking events to members and projects...')
  for (let i = 0; i < events.length; i++) {
    const numMembers = Math.floor(Math.random() * 5) + 3 // 3-7 attendees
    const selectedMembers = members
      .sort(() => Math.random() - 0.5)
      .slice(0, numMembers)
    
    await prisma.event.update({
      where: { id: events[i].id },
      data: {
        attendees: {
          connect: selectedMembers.map(m => ({ id: m.id })),
        },
        projects: {
          connect: i < projects.length ? [{ id: projects[i % projects.length].id }] : [],
        },
        equipments: {
          connect: i < equipments.length ? [{ id: equipments[i % equipments.length].id }] : [],
        },
      },
    })
  }

  // Create Collaborators
  console.log('🤝 Creating collaborators...')
  const collaboratorNames = [
    { name: 'Dr. Sarah Cohen', organization: 'Weizmann Institute' },
    { name: 'Prof. David Levy', organization: 'Hebrew University' },
    { name: 'Dr. Rachel Ben-David', organization: 'Technion' },
    { name: 'Dr. Michael Rosen', organization: 'Tel Aviv University' },
  ]

  const collaborators = []
  for (const collab of collaboratorNames) {
    const collaborator = await prisma.collaborator.create({
      data: collab,
    })
    collaborators.push(collaborator)
  }

  // Link collaborators to projects (M:N)
  console.log('🔗 Linking collaborators to projects...')
  for (let i = 0; i < projects.length; i++) {
    const numCollabs = Math.floor(Math.random() * 2) + 1 // 1-2 collaborators per project
    const selectedCollabs = collaborators
      .sort(() => Math.random() - 0.5)
      .slice(0, numCollabs)
    
    await prisma.project.update({
      where: { id: projects[i].id },
      data: {
        collaborators: {
          connect: selectedCollabs.map(c => ({ id: c.id })),
        },
      },
    })
  }

  // Create Documents
  console.log('📎 Creating documents...')
  const documents = []
  for (let i = 0; i < members.length; i++) {
    // Create CV for some members
    if (i < 3) {
      const doc = await prisma.document.create({
        data: {
          filename: `${members[i].name}_CV.pdf`,
          url: `/documents/cv_${members[i].id}.pdf`,
          memberId: members[i].id,
        },
      })
      documents.push(doc)
    }
  }

  // Create documents for projects
  for (let i = 0; i < projects.length; i++) {
    const doc = await prisma.document.create({
      data: {
        filename: `${projects[i].title}_Protocol.pdf`,
        url: `/documents/protocol_${projects[i].id}.pdf`,
        projectId: projects[i].id,
      },
    })
    documents.push(doc)
  }

  // Create Bookings
  console.log('📆 Creating bookings...')
  for (let i = 0; i < 10; i++) {
    const startTime = new Date()
    startTime.setDate(startTime.getDate() + i)
    startTime.setHours(9 + (i % 8), 0, 0, 0)
    const endTime = new Date(startTime)
    endTime.setHours(startTime.getHours() + 2)

    await prisma.booking.create({
      data: {
        startTime,
        endTime,
        purpose: `Equipment booking ${i + 1}`,
        equipmentId: equipments[i % equipments.length].id,
        memberId: members[i % members.length].id,
        projectId: i < projects.length ? projects[i % projects.length].id : null,
        eventId: i < events.length ? events[i % events.length].id : null,
      },
    })
  }

  // Create Expenses
  console.log('💸 Creating expenses...')
  const expenseDescriptions = [
    'Lab supplies - Reagents and chemicals',
    'Equipment maintenance - Annual service',
    'Conference travel - Registration and accommodation',
    'Software license - Annual subscription',
    'Reagents - DNA extraction kits',
    'Equipment purchase - New microscope',
    'Training course - Bioinformatics workshop',
    'Publication fees - Open access journal',
    'Equipment repair - Centrifuge maintenance',
    'Travel expenses - Research collaboration visit',
    'Software tools - Data analysis platform',
    'Lab consumables - Pipette tips and tubes',
    'Equipment upgrade - Sequencer upgrade',
    'Conference presentation - Poster printing',
    'Research materials - Cell culture media',
    'Equipment calibration - Annual service',
    'Travel - Field research expedition',
    'Software - Statistical analysis package',
    'Lab equipment - Safety equipment',
    'Publication - Article processing charges',
  ]

  // Create expenses linked to projects and grants
  for (let i = 0; i < expenseDescriptions.length; i++) {
    const expenseDate = new Date()
    expenseDate.setMonth(expenseDate.getMonth() - (i % 6))
    
    // Determine which project and grant to link
    const projectIndex = i % projects.length
    const project = projects[projectIndex]
    
    // Get grants linked to this project
    const projectWithGrants = await prisma.project.findUnique({
      where: { id: project.id },
      include: { grants: true },
    })
    
    const linkedGrants = projectWithGrants?.grants || []
    const grant = linkedGrants.length > 0 
      ? linkedGrants[i % linkedGrants.length]
      : (i < grants.length ? grants[i % grants.length] : null)

    await prisma.expense.create({
      data: {
        description: expenseDescriptions[i],
        amount: Math.random() * 5000 + 100, // $100 - $5100
        date: expenseDate,
        projectId: project.id,
        grantId: grant?.id || null,
        eventId: i % 5 === 0 && i < events.length ? events[i % events.length].id : null, // Some expenses linked to events
      },
    })
  }
  
  // Create additional expenses linked only to grants (not projects)
  for (let i = 0; i < 5; i++) {
    const expenseDate = new Date()
    expenseDate.setMonth(expenseDate.getMonth() - (i % 3))
    
    await prisma.expense.create({
      data: {
        description: `Grant overhead expense ${i + 1}: Administrative costs`,
        amount: Math.random() * 2000 + 500, // $500 - $2500
        date: expenseDate,
        projectId: null,
        grantId: grants[i % grants.length].id,
        eventId: null,
      },
    })
  }

  // Create NoteTasks
  console.log('📝 Creating notes and tasks...')
  const taskTitles = [
    'Review paper draft',
    'Prepare presentation',
    'Order lab supplies',
    'Schedule meeting',
    'Update protocol',
    'Analyze data',
  ]

  for (let i = 0; i < 20; i++) {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + (i % 14))

    await prisma.noteTask.create({
      data: {
        title: taskTitles[i % taskTitles.length],
        content: `Task content ${i + 1}`,
        completed: i % 3 === 0, // Some tasks are completed
        dueDate: i % 2 === 0 ? dueDate : null,
        // Randomly assign to different entities
        memberId: i % 4 === 0 ? members[i % members.length].id : null,
        projectId: i % 4 === 1 ? projects[i % projects.length].id : null,
        grantId: i % 4 === 2 ? grants[i % grants.length].id : null,
        equipmentId: i % 4 === 3 ? equipments[i % equipments.length].id : null,
      },
    })
  }

  console.log('✅ Dummy data created successfully!')
  console.log(`   - ${projects.length} projects`)
  console.log(`   - ${grants.length} grants`)
  console.log(`   - ${equipments.length} equipment items`)
  console.log(`   - ${publications.length} publications`)
  console.log(`   - ${events.length} events`)
  console.log(`   - ${collaborators.length} collaborators`)
  console.log(`   - ${documents.length} documents`)
  console.log(`   - 10 bookings`)
  console.log(`   - 25 expenses (20 linked to projects/grants, 5 grant overhead)`)
  console.log(`   - 20 notes/tasks`)
}

main()
  .catch((e) => {
    console.error('Error seeding dummy data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

