import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticatedRequest } from '../types';
import { TableStatus } from '@prisma/client';

// Get all tables with filters
export const getAllTables = async (req: Request, res: Response) => {
  try {
    const { capacity, status, location, limit = 50, offset = 0 } = req.query;

    const where: any = {};

    if (capacity) {
      where.capacity = parseInt(String(capacity));
    }

    if (status) {
      where.status = String(status).toUpperCase();
    }

    if (location) {
      where.location = { contains: String(location), mode: 'insensitive' };
    }

    const total = await prisma.table.count({ where });

    const tables = await prisma.table.findMany({
      where,
      skip: parseInt(String(offset)),
      take: parseInt(String(limit)),
      orderBy: { tableNumber: 'asc' }
    });

    res.status(200).json({
      status: 'OK',
      message: 'Tables retrieved successfully',
      data: {
        total,
        limit: parseInt(String(limit)),
        offset: parseInt(String(offset)),
        tables
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch tables',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Get single table by ID
export const getTableById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const table = await prisma.table.findUnique({
      where: { id },
      include: {
        reservations: {
          where: {
            status: 'CONFIRMED'
          },
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!table) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Table not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      status: 'OK',
      message: 'Table retrieved successfully',
      data: table,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching table:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch table',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Create new table (Admin only)
export const createTable = async (req: authenticatedRequest, res: Response) => {
  try {
    const { tableNumber, capacity, location, tableType, ambiance } = req.body;

    // Validation
    if (!tableNumber || !capacity || !location) {
      return res.status(400).json({
        status: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: [
          { field: 'tableNumber', message: 'Table number is required' },
          { field: 'capacity', message: 'Capacity is required' },
          { field: 'location', message: 'Location is required' }
        ],
        timestamp: new Date().toISOString()
      });
    }

    // Check if table number already exists
    const existingTable = await prisma.table.findFirst({
      where: { tableNumber: parseInt(String(tableNumber)) }
    });

    if (existingTable) {
      return res.status(409).json({
        status: 'ERROR',
        message: `Table number ${tableNumber} already exists`,
        timestamp: new Date().toISOString()
      });
    }

    const newTable = await prisma.table.create({
      data: {
        tableNumber: parseInt(String(tableNumber)),
        capacity: parseInt(String(capacity)),
        location: String(location),
        tableType: tableType || 'Standard',
        ambiance: ambiance || 'Casual',
        status: 'AVAILABLE'
      }
    });

    res.status(201).json({
      status: 'OK',
      message: 'Table created successfully',
      data: newTable,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating table:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to create table',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Update table (Admin only)
export const updateTable = async (req: authenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { capacity, location, tableType, ambiance } = req.body;

    // Check if table exists
    const existingTable = await prisma.table.findUnique({ where: { id } });
    if (!existingTable) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Table not found',
        timestamp: new Date().toISOString()
      });
    }

    const updatedTable = await prisma.table.update({
      where: { id },
      data: {
        ...(capacity && { capacity: parseInt(String(capacity)) }),
        ...(location && { location: String(location) }),
        ...(tableType && { tableType: String(tableType) }),
        ...(ambiance && { ambiance: String(ambiance) })
      }
    });

    res.status(200).json({
      status: 'OK',
      message: 'Table updated successfully',
      data: updatedTable,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating table:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update table',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Delete table (Admin only)
export const deleteTable = async (req: authenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if table exists
    const existingTable = await prisma.table.findUnique({ where: { id } });
    if (!existingTable) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Table not found',
        timestamp: new Date().toISOString()
      });
    }

    // Check for active reservations
    const activeReservations = await prisma.reservation.count({
      where: {
        tableId: id,
        status: 'CONFIRMED'
      }
    });

    if (activeReservations > 0) {
      return res.status(409).json({
        status: 'ERROR',
        message: 'Cannot delete table with active reservations',
        timestamp: new Date().toISOString()
      });
    }

    await prisma.table.delete({ where: { id } });

    res.status(200).json({
      status: 'OK',
      message: 'Table deleted successfully',
      data: { id },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to delete table',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Get available tables for a specific date and time
export const getAvailableTables = async (req: Request, res: Response) => {
  try {
    const { capacity, datetime } = req.query;

    if (!capacity || !datetime) {
      return res.status(400).json({
        status: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: [
          { field: 'capacity', message: 'Capacity is required' },
          { field: 'datetime', message: 'DateTime is required' }
        ],
        timestamp: new Date().toISOString()
      });
    }

    const requiredCapacity = parseInt(String(capacity));
    const reservationTime = new Date(String(datetime));

    // Check for conflicts with existing reservations
    const conflictingReservations = await prisma.reservation.findMany({
      where: {
        status: 'CONFIRMED',
        reservationDate: {
          gte: new Date(reservationTime.getTime() - 2 * 60 * 60 * 1000),
          lte: new Date(reservationTime.getTime() + 2 * 60 * 60 * 1000)
        }
      },
      select: { tableId: true }
    });

    const occupiedTableIds = conflictingReservations.map(r => r.tableId);

    const availableTables = await prisma.table.findMany({
      where: {
        capacity: { gte: requiredCapacity },
        status: 'AVAILABLE',
        id: { notIn: occupiedTableIds }
      },
      orderBy: { capacity: 'asc' }
    });

    res.status(200).json({
      status: 'OK',
      message: 'Available tables retrieved successfully',
      data: {
        requestedCapacity: requiredCapacity,
        requestedDateTime: reservationTime,
        availableCount: availableTables.length,
        tables: availableTables
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching available tables:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch available tables',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Update table status (Admin/Staff only)
export const updateTableStatus = async (req: authenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'];

    if (!status || !validStatuses.includes(String(status).toUpperCase())) {
      return res.status(400).json({
        status: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: [{
          field: 'status',
          message: `Status must be one of: ${validStatuses.join(', ')}`
        }],
        timestamp: new Date().toISOString()
      });
    }

    // Check if table exists
    const existingTable = await prisma.table.findUnique({ where: { id } });
    if (!existingTable) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Table not found',
        timestamp: new Date().toISOString()
      });
    }

    const normalizedStatus = String(status).toUpperCase() as TableStatus;
    const updatedTable = await prisma.table.update({
      where: { id },
      data: { status: normalizedStatus }
    });

    res.status(200).json({
      status: 'OK',
      message: 'Table status updated successfully',
      data: {
        id,
        tableNumber: updatedTable.tableNumber,
        status: updatedTable.status
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating table status:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update table status',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Get tables by type/ambiance
export const getTablesByAmbiance = async (req: Request, res: Response) => {
  try {
    const { ambiance } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const tables = await prisma.table.findMany({
      where: {
        ambiance: { contains: String(ambiance), mode: 'insensitive' },
        status: 'AVAILABLE'
      },
      skip: parseInt(String(offset)),
      take: parseInt(String(limit)),
      orderBy: { capacity: 'asc' }
    });

    const total = await prisma.table.count({
      where: {
        ambiance: { contains: String(ambiance), mode: 'insensitive' },
        status: 'AVAILABLE'
      }
    });

    res.status(200).json({
      status: 'OK',
      message: `Tables with ${ambiance} ambiance retrieved successfully`,
      data: {
        ambiance,
        total,
        tables
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching tables by ambiance:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch tables by ambiance',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Get floor-plan friendly table data grouped by status
export const getFloorPlan = async (req: Request, res: Response) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { tableNumber: 'asc' },
      select: {
        id: true,
        tableNumber: true,
        capacity: true,
        location: true,
        tableType: true,
        status: true
      }
    });

    const grouped = {
      AVAILABLE: tables.filter((table) => table.status === 'AVAILABLE'),
      RESERVED: tables.filter((table) => table.status === 'RESERVED'),
      OCCUPIED: tables.filter((table) => table.status === 'OCCUPIED'),
      MAINTENANCE: tables.filter((table) => table.status === 'MAINTENANCE')
    };

    return res.status(200).json({
      status: 'OK',
      message: 'Floor plan data retrieved successfully',
      data: {
        totalTables: tables.length,
        summary: {
          available: grouped.AVAILABLE.length,
          reserved: grouped.RESERVED.length,
          occupied: grouped.OCCUPIED.length,
          maintenance: grouped.MAINTENANCE.length
        },
        tables,
        grouped
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching floor plan:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch floor plan',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Predict which occupied tables are likely to clear soon
export const getTableClearanceForecast = async (req: Request, res: Response) => {
  try {
    const averageDiningMinutes = req.query.averageDiningMinutes
      ? Number(req.query.averageDiningMinutes)
      : 90;

    const occupiedTables = await prisma.table.findMany({
      where: {
        status: { in: ['OCCUPIED', 'RESERVED'] }
      },
      include: {
        reservations: {
          where: {
            status: { in: ['CONFIRMED', 'COMPLETED'] }
          },
          orderBy: {
            updatedAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: { tableNumber: 'asc' }
    });

    const now = Date.now();
    const forecast = occupiedTables.map((table) => {
      const latestReservation = table.reservations[0];
      const referenceTime = latestReservation
        ? new Date(latestReservation.updatedAt).getTime()
        : now;

      const estimatedClearAt = new Date(referenceTime + averageDiningMinutes * 60000);
      const minutesToClear = Math.max(0, Math.ceil((estimatedClearAt.getTime() - now) / 60000));

      return {
        id: table.id,
        tableNumber: table.tableNumber,
        status: table.status,
        capacity: table.capacity,
        location: table.location,
        estimatedClearAt,
        estimatedMinutesToClear: minutesToClear
      };
    });

    forecast.sort((a, b) => a.estimatedMinutesToClear - b.estimatedMinutesToClear);

    return res.status(200).json({
      status: 'OK',
      message: 'Table clearance forecast generated successfully',
      data: {
        averageDiningMinutes,
        forecastCount: forecast.length,
        forecast
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating table clearance forecast:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Failed to generate table clearance forecast',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};
