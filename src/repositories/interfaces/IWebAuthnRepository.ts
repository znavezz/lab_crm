/**
 * WebAuthn Repository Interface
 * 
 * Abstract contract for WebAuthn (biometric authentication) data access.
 */

export interface WebAuthnChallenge {
  id: string;
  userId: string;
  challenge: string;
  expiresAt: Date;
  type: string; // 'registration' | 'authentication'
  createdAt: Date;
}

export interface Authenticator {
  credentialID: string;
  userId: string;
  providerAccountId: string;
  credentialPublicKey: string;
  counter: number;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  transports: string | null;
}

export interface CreateChallengeData {
  userId: string;
  challenge: string;
  type: string;
  expiresAt: Date;
}

export interface CreateAuthenticatorData {
  credentialID: string;
  userId: string;
  providerAccountId: string;
  credentialPublicKey: string;
  counter: number;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  transports?: string | null;
}

/**
 * WebAuthn Repository Interface
 * 
 * Handles biometric authentication challenges and registered devices
 */
export interface IWebAuthnRepository {
  // ===== Challenge Operations =====
  
  /**
   * Create a new WebAuthn challenge
   */
  createChallenge(data: CreateChallengeData): Promise<WebAuthnChallenge>;
  
  /**
   * Find the latest valid challenge for a user
   */
  findLatestChallenge(userId: string, type: string): Promise<WebAuthnChallenge | null>;
  
  /**
   * Delete a specific challenge
   */
  deleteChallenge(id: string): Promise<void>;
  
  /**
   * Delete all challenges of a specific type for a user
   */
  deleteUserChallenges(userId: string, type: string): Promise<void>;
  
  /**
   * Delete expired challenges (for cleanup jobs)
   */
  deleteExpiredChallenges(): Promise<number>;
  
  // ===== Authenticator Operations =====
  
  /**
   * Create a new authenticator (registered device)
   */
  createAuthenticator(data: CreateAuthenticatorData): Promise<Authenticator>;
  
  /**
   * Find all authenticators for a user
   */
  findAuthenticatorsByUserId(userId: string): Promise<Authenticator[]>;
  
  /**
   * Find a specific authenticator by credential ID
   */
  findAuthenticatorByCredentialId(userId: string, credentialId: string): Promise<Authenticator | null>;
  
  /**
   * Update authenticator counter (for replay attack prevention)
   */
  updateAuthenticatorCounter(userId: string, credentialId: string, counter: number): Promise<void>;
  
  /**
   * Delete an authenticator (user removes device)
   */
  deleteAuthenticator(userId: string, credentialId: string): Promise<void>;
  
  /**
   * Delete all authenticators for a user (account deletion)
   */
  deleteUserAuthenticators(userId: string): Promise<void>;
}

