import { z } from 'zod';

// Score submission validation schema
export const submitScoreSchema = z.object({
  session_id: z
    .string()
    .min(1, 'Session ID is required')
    .regex(/^cs_/, 'Invalid session ID format'),
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .trim(),
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .trim()
    .toLowerCase(),
  nickname: z
    .string()
    .min(2, 'Nickname must be at least 2 characters')
    .max(30, 'Nickname must be less than 30 characters')
    .trim()
    .regex(
      /^[a-zA-Z0-9_\-\s]+$/,
      'Nickname can only contain letters, numbers, underscores, hyphens, and spaces'
    ),
  country: z
    .string()
    .length(2, 'Country code must be 2 characters')
    .toUpperCase(),
  score: z
    .number()
    .int('Score must be an integer')
    .min(0, 'Score cannot be negative')
    .max(999999, 'Score exceeds maximum'),
});

export type SubmitScoreInput = z.infer<typeof submitScoreSchema>;

// Session validation schema
export const validateSessionSchema = z.object({
  session_id: z
    .string()
    .min(1, 'Session ID is required')
    .regex(/^cs_/, 'Invalid session ID format'),
});

export type ValidateSessionInput = z.infer<typeof validateSessionSchema>;

// Leaderboard query validation schema
export const leaderboardQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => {
      const num = parseInt(val || '1', 10);
      return isNaN(num) || num < 1 ? 1 : num;
    }),
  search: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined),
});

export type LeaderboardQueryInput = z.infer<typeof leaderboardQuerySchema>;

// Admin settings validation schema
export const tournamentSettingsSchema = z.object({
  start_date: z
    .string()
    .datetime()
    .optional()
    .nullable(),
  end_date: z
    .string()
    .datetime()
    .optional()
    .nullable(),
  prize_amount: z
    .number()
    .int()
    .min(0)
    .max(1000000)
    .optional(),
  is_active: z.boolean().optional(),
  max_entries: z
    .number()
    .int()
    .min(0)
    .optional()
    .nullable(),
});

export type TournamentSettingsInput = z.infer<typeof tournamentSettingsSchema>;
