import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Função para gerar hash da senha do admin (1234@@)
export async function generateAdminHash(): Promise<string> {
  return hashPassword('1234@@')
}
