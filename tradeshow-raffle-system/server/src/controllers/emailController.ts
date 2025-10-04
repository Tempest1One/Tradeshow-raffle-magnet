import type { Request, Response } from 'express';
import { EmailEntry } from '../models/EmailEntry.ts';

export const createEmailEntry = async (req: Request, res: Response) => {
  try {
    const { email, sessionId } = req.body;
    
    // Validate required fields
    if (!email || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, sessionId'
      });
    }
    
    // Check for duplicates
    const existingEntry = await (EmailEntry as any).isDuplicate(email, sessionId);
    if (existingEntry) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists in this session'
      });
    }
    
    // Create new email entry
    const emailEntry = new EmailEntry({
      email,
      sessionId,
      timestamp: new Date()
    });
    
    await emailEntry.save();
    
    res.status(201).json({
      success: true,
      message: 'Email entry created successfully',
      data: {
        id: emailEntry._id,
        email: emailEntry.email,
        timestamp: emailEntry.timestamp
      }
    });
    
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