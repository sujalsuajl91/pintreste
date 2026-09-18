import {
  boolean,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'

/**
 * Better Auth core tables.
 * Column names are camelCase to match Better Auth's defaults — do not rename.
 * The profile columns (username, bio, website) are PinBoard additions to the
 * user record so a creator's public profile lives alongside their auth row.
 */
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  // PinBoard profile fields
  username: text('username').unique(),
  bio: text('bio'),
  website: text('website'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

/**
 * Social graph. A row means `followerId` follows `followingId`.
 * No foreign keys by default (per stack guidance) — scoping is done in queries.
 * The unique constraint prevents duplicate follow rows.
 */
export const follow = pgTable(
  'follow',
  {
    id: serial('id').primaryKey(),
    followerId: text('followerId').notNull(),
    followingId: text('followingId').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (t) => ({
    uniqueFollow: unique().on(t.followerId, t.followingId),
  }),
)

export type User = typeof user.$inferSelect
export type Follow = typeof follow.$inferSelect
