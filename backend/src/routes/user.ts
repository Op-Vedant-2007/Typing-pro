import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// GET /api/user/settings
router.get('/settings', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId,
          theme: 'typeflow-dark',
          soundEnabled: true,
          soundTheme: 'mechanical',
          fontSize: 'medium',
          fontFamily: 'JetBrains Mono',
          caretStyle: 'line',
          preferredTestDuration: 30,
          preferredWordCount: 25,
          preferredMode: 'time',
          punctuation: false,
          numbers: false,
        },
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
});

// PUT /api/user/settings
router.put('/settings', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const {
      theme,
      soundEnabled,
      soundTheme,
      fontSize,
      fontFamily,
      caretStyle,
      preferredTestDuration,
      preferredWordCount,
      preferredMode,
      preferredLanguage,
      punctuation,
      numbers,
    } = req.body;

    const updated = await prisma.userSettings.upsert({
      where: { userId },
      update: {
        ...(theme !== undefined && { theme: String(theme) }),
        ...(soundEnabled !== undefined && { soundEnabled: Boolean(soundEnabled) }),
        ...(soundTheme !== undefined && { soundTheme: String(soundTheme) }),
        ...(fontSize !== undefined && { fontSize: String(fontSize) }),
        ...(fontFamily !== undefined && { fontFamily: String(fontFamily) }),
        ...(caretStyle !== undefined && { caretStyle: String(caretStyle) }),
        ...(preferredTestDuration !== undefined && { preferredTestDuration: Number(preferredTestDuration) }),
        ...(preferredWordCount !== undefined && { preferredWordCount: Number(preferredWordCount) }),
        ...(preferredMode !== undefined && { preferredMode: String(preferredMode) }),
        ...(preferredLanguage !== undefined && { preferredLanguage: String(preferredLanguage) }),
        ...(punctuation !== undefined && { punctuation: Boolean(punctuation) }),
        ...(numbers !== undefined && { numbers: Boolean(numbers) }),
      },
      create: {
        userId,
        theme: theme || 'typeflow-dark',
        soundEnabled: soundEnabled !== undefined ? Boolean(soundEnabled) : true,
        soundTheme: soundTheme || 'mechanical',
        fontSize: fontSize || 'medium',
        fontFamily: fontFamily || 'JetBrains Mono',
        caretStyle: caretStyle || 'line',
        preferredTestDuration: Number(preferredTestDuration) || 30,
        preferredWordCount: Number(preferredWordCount) || 25,
        preferredMode: preferredMode || 'time',
        preferredLanguage: preferredLanguage || 'english',
        punctuation: Boolean(punctuation),
        numbers: Boolean(numbers),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// PUT /api/user/profile
router.put('/profile', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { name, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updateData: any = {};

    if (name && typeof name === 'string' && name.trim()) {
      updateData.name = name.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ error: 'Current password is required to change password' });
        return;
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        res.status(400).json({ error: 'Current password does not match' });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({ error: 'New password must be at least 6 characters' });
        return;
      }

      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    res.json({
      user: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
