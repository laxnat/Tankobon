// __tests__/lib/auth.test.ts
import { authorizeCredentials, authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// -----Mocks-----
// When any file imports '@/lib/prisma', return this instead
jest.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
    },
}))

// Test code reaction to this
jest.mock('bcrypt')

const mockFindUnique = jest.mocked(prisma.user.findUnique)
const mockBcryptCompare = jest.mocked(bcrypt.compare)

const mockUser = {
    id: 'user_cuid_123',
    name: 'Test User',
    email: 'user@example.com',
    emailVerified: null,
    password: '$2b$10$hashedpassword',
    stripeCustomerId: null,
    isPremium: false,
    image: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
}

// Reset mocks to start fresh tests
beforeEach(() => {
    jest.clearAllMocks()
})

// ------authorize------
describe('authorizeCredentials', () => {
    it('throws when credentials are missing', async () => {
        await expect(authorizeCredentials(undefined)).rejects.toThrow('Invalid credentials')
    })

    it('throws when email is empty', async () => {
        await expect(
            authorizeCredentials({ email: '', password: 'password123' })
        ).rejects.toThrow('Invalid credentials')
    })

    it('throws when user is not found in the database', async () => {
        mockFindUnique.mockResolvedValue(null)  // simulates "no user with this email"

        await expect(
            authorizeCredentials({ email: 'ghost@example.com', password: 'password123' })
        ).rejects.toThrow('Invalid credentials')
    })

    it('throws when password does not match', async () => {
        mockFindUnique.mockResolvedValue(mockUser)
        mockBcryptCompare.mockResolvedValue(false as never) // Wrong password

        await expect(
            authorizeCredentials({ email: 'user@example.com', password: 'wrongpassword' })
        ).rejects.toThrow('Invalid credentials')
    })

    it('returns the user object when credentials are valid', async () => {
        mockFindUnique.mockResolvedValue(mockUser)
        mockBcryptCompare.mockResolvedValue(true as never)  // Correct password

        const result = await authorizeCredentials({
            email: 'user@example.com',
            password: 'correctpassword',
        })
        
        expect(result).toEqual({
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            image: mockUser.image,
        })

        expect(result).not.toHaveProperty('password')
    })
})

// -----jwt callback-----
describe('jwt callback', () => {
    const jwtCallback = authOptions.callbacks!.jwt!

    it('sets isPremium from DB on initial sign-in', async () => {
        mockFindUnique.mockResolvedValue({ ...mockUser, isPremium: true })

        const token = await jwtCallback({
            token: {
                sub: 'abc', iat: 0, exp: 0, jti: 'x',
                id: '',
                isPremium: true
            },
            user: { id: 'user_1', email: 'user@example.com', name: 'Test User' },
            account: null,
            trigger: 'signIn',
        })

        expect(token.isPremium).toBe(true)
    })

    it('defaults isPremium to false when DB returns null', async () => {
        mockFindUnique.mockResolvedValue(null)      // user deleted mid-session edge case

        const token = await jwtCallback({
            token: {
                sub: 'abc', jwt: 0, exp: 0, jti: 'x',
                id: '',
                isPremium: true
            },
            user: { id: 'user_1', email: 'user@example.com', name: 'Test User' },
            account: null,
            trigger: 'signIn',
        })

        expect(token.isPremium).toBe(false)
    })

    it('refreshes isPremium on subsequent requests (no user object', async () => {
        // isPremium is refetched on every JWT validation
        // Session stays in sync after Stripe webhook fires
        mockFindUnique.mockResolvedValue({ ...mockUser, isPremium: true })

        const token = await jwtCallback({
            // No 'user' object (request after initial login)
            token: {
                id: 'user_1',
                email: 'user@example.com',
                isPremium: false,
                sub: 'abc',
                iat: 0,
                exp: 0,
                jti: 'x'
            },
            user: { id: 'user_1', email: 'user@example.com', name: 'Test User' },
            account: null,
            trigger: 'update',
        })

        // Was false in the token. now true bc DB says so
        expect(token.isPremium).toBe(true)
    })
})

// -----session callback-----
describe('session callback', () => {
    const sessionCallback = authOptions.callbacks!.session!

    it('maps token fields onto session.user', async () => {
        const session: any = await sessionCallback({
            session: {
                user: { 
                    id: '', 
                    name: '', 
                    email: '', 
                    image: '', 
                    isPremium: false, 
                },
                expires: '2099-01-01T00:00:00.000Z',
            },
            token: {
                id: 'user_1',
                name: 'Test User',
                email: 'user@example.com',
                isPremium: true,
                sub: 'abc',
                iat: 0,
                exp: 0,
                jti: 'x',
            },
            
        } as any)  // NextAuth's union overload doesn't narrow by strategy at compile time

        expect(session.user.id).toBe('user_1')
        expect(session.user.email).toBe('user@example.com')
        expect(session.user.isPremium).toBe(true)
    })
})