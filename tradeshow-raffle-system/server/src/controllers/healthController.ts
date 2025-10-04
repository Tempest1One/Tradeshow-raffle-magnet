import type { Request, Response } from 'express';
import { connectionInstance } from '../database/connection.js';

export const getHealth = (req: Request, res: Response) => {
    try {
        const dbStatus = connectionInstance.getConnectionStatus();
        const status = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            message: 'Tradeshow Raffle System Server is running',
            dbStatus
        }
        res.json(status);
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'health check failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            dbStatus: false
        })
    }
}