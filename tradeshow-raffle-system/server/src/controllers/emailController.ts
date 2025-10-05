import type { Request, Response } from 'express';
import { EmailEntry } from '../models/EmailEntry.ts';
import { EmailEventHandler } from '../handlers/emailEventHandler.ts';

export const createEmailEntry = async (req: Request, res: Response) => {
  try {
    const { email, sessionId, ipAddress, userAgent } = req.body;

    // Validate required fields
    if (!email || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, sessionId'
      });
    }

    // Use centralized EmailEventHandler
    const result = await EmailEventHandler.handleEmailSubmission(
      null, // No socket for REST API
      {
        email,
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'REST API'
      },
      sessionId
    );

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(409).json(result);
    }

  } catch (error) {
    console.error('Error creating email entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create email entry',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getEmailStats = async (req: Request, res: Response) => {
  try {
    const stats = await (EmailEntry as any).getStats();
    res.json({
      success: true,
      data: stats[0] || {
        totalEmails: 0,
        validEmails: 0,
        invalidEmails: 0,
        prizesAwarded: 0
      }
    });
  } catch (error) {
    console.error('Error getting email stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};