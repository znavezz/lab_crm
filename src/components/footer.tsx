export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
        <p>© {currentYear} Bioinformatics Lab CRM. All rights reserved.</p>
      </div>
    </footer>
  )
}
