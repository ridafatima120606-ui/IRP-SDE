import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticatedRequest } from '../types';

// Helper function to find best available table
async function findBestTable(capacity: number, reservationDate: Date) {
  // Find tables that don't have conflicts
  const conflictingReservations = await prisma.reservation.findMany({
    where: {
      status: 'CONFIRMED',
      reservationDate: reservationDate
    },
    select: { tableId: true }
  });

  const occupiedTableIds = conflictingReservations.map(r => r.tableId);

  // Find best table (smallest capacity that fits)
  const bestTable = await prisma.table.findFirst({
    where: {
      capacity: { gte: capacity },
      status: 'AVAILABLE',
      id: { notIn: occupiedTableIds }
    },
    orderBy: [{ capacity: 'asc' }, { tableNumber: 'asc' }]
  });

  return bestTable;
}

// Create reservation
export const createReservation = async (req: authenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { guestCount, reservationDate, reservationTime, tableId, specialRequests } = req.body;

    // Validation
    if (!guestCount || !reservationDate || !reservationTime) {
      return res.status(400).json({
        status: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: [
          { field: 'guestCount', message: 'Guest count is required' },
          { field: 'reservationDate', message: 'Reservation date is required' },
          { field: 'reservationTime', message: 'Reservation time is required' }
        ],
        timestamp: new Date().toISOString()
      });
    }

    const resDate = new Date(reservationDate);
    const resTime = new Date(reservationTime);

    // Check if time is in the past
    if (resTime < new Date()) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Cannot create reservation for past date',
        timestamp: new Date().toISOString()
      });
    }

    let assignedTableId = tableId;

    // If no specific table requested, find the best available one
    if (!tableId) {
      const bestTable = await findBestTable(guestCount, resTime);

      if (!bestTable) {
        return res.status(409).json({
          status: 'ERROR',
          message: 'No available tables for the requested time and guest count',
          data: {
            requestedCapacity: guestCount,
              requestedDate: resTime
          },
          timestamp: new Date().toISOString()
        });
      }

      assignedTableId = bestTable.id;
    } else {
      // Validate that the requested table exists and has proper capacity
      const requestedTable = await prisma.table.findUnique({
        where: { id: tableId }
      });

      if (!requestedTable) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Table not found',
          timestamp: new Date().toISOString()
        });
      }

      if (requestedTable.capacity < guestCount) {
        return res.status(400).json({
          status: 'ERROR',
          message: `Table capacity (${requestedTable.capacity}) is less than requested guests (${guestCount})`,
          timestamp: new Date().toISOString()
        });
      }

      // Check for conflicts
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          tableId,
          status: 'CONFIRMED',
          reservationDate: resTime
        }
      });

      if (existingReservation) {
        return res.status(409).json({
          status: 'ERROR',
          message: 'Table is not available at the requested time',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        userId,
        tableId: assignedTableId,
        guestCount: parseInt(String(guestCount)),
        reservationDate: resDate,
        reservationTime: resTime,
        specialRequests: specialRequests || '',
        status: 'CONFIRMED'
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        table: true
      }
    });

    // Update table status if it's the current time
    const now = new Date();
    if (reservation.reservationTime <= now) {
      await prisma.table.update({
        where: { id: assignedTableId },
        data: { status: 'OCCUPIED' }
      });
    } else if (reservation.reservationDate > now) {
      await prisma.table.update({
        where: { id: assignedTableId },
        data: { status: 'RESERVED' }
      });
    }

    res.status(201).json({
      status: 'OK',
      message: 'Reservation created successfully',
      data: {
        reservation: {
          ...reservation,
          estimatedWaitTime: 10
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to create reservation',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Get user's reservations
export const getUserReservations = async (req: authenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status, limit = 20, offset = 0 } = req.query;

    const where: any = { userId };

    if (status) {
      where.status = String(status).toUpperCase();
    }

    const total = await prisma.reservation.count({ where });

    const reservations = await prisma.reservation.findMany({
      where,
      skip: parseInt(String(offset)),
      take: parseInt(String(limit)),
      include: {
        table: true,
        user: { select: { id: true, name: true, email: true, phone: true } }
      },
      orderBy: { reservationDate: 'desc' }
    });

    res.status(200).json({
      status: 'OK',
      message: 'User reservations retrieved successfully',
      data: {
        total,
        limit: parseInt(String(limit)),
        offset: parseInt(String(offset)),
        reservations
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch reservations',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Get reservation by ID
export const getReservationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        table: true,
        user: { select: { id: true, name: true, email: true, phone: true } }
      }
    });

    if (!reservation) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Reservation not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      status: 'OK',
      message: 'Reservation retrieved successfully',
      data: reservation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch reservation',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Cancel reservation
export const cancelReservation = async (req: authenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const reservation = await prisma.reservation.findUnique({
      where: { id }
    });

    if (!reservation) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Reservation not found',
        timestamp: new Date().toISOString()
      });
    }

    // Can't cancel completed or already cancelled reservations
    if (['COMPLETED', 'CANCELLED'].includes(reservation.status)) {
      return res.status(409).json({
        status: 'ERROR',
        message: `Cannot cancel ${reservation.status} reservation`,
        timestamp: new Date().toISOString()
      });
    }

    // Update reservation status
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        table: true
      }
    });

    // Free up the table
    await prisma.table.update({
      where: { id: reservation.tableId },
      data: { status: 'AVAILABLE' }
    });

    res.status(200).json({
      status: 'OK',
      message: 'Reservation cancelled successfully',
      data: {
        reservation: updatedReservation,
        reason: reason || 'Not specified'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to cancel reservation',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Check-in reservation
export const checkInReservation = async (req: authenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { table: true }
    });

    if (!reservation) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Reservation not found',
        timestamp: new Date().toISOString()
      });
    }

    if (reservation.status !== 'CONFIRMED') {
      return res.status(409).json({
        status: 'ERROR',
        message: `Cannot check in ${reservation.status} reservation`,
        timestamp: new Date().toISOString()
      });
    }

    // Update reservation status to mark as completed (checked in)
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: {
        table: true,
        user: { select: { id: true, name: true } }
      }
    });

    // Update table status
    await prisma.table.update({
      where: { id: reservation.tableId },
      data: { status: 'OCCUPIED' }
    });

    res.status(200).json({
      status: 'OK',
      message: 'Guest checked in successfully',
      data: {
        reservation: updatedReservation
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking in reservation:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to check in guest',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Get available time slots
export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { date, capacity } = req.query;

    if (!date || !capacity) {
      return res.status(400).json({
        status: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: [
          { field: 'date', message: 'Date is required' },
          { field: 'capacity', message: 'Capacity is required' }
        ],
        timestamp: new Date().toISOString()
      });
    }

    const selectedDate = new Date(String(date));
    selectedDate.setHours(0, 0, 0, 0);

    const requiredCapacity = parseInt(String(capacity));

    // Get all reservations for the day
    const dayEndTime = new Date(selectedDate);
    dayEndTime.setHours(23, 59, 59, 999);

    const reservations = await prisma.reservation.findMany({
      where: {
        reservationDate: {
          gte: selectedDate,
          lte: dayEndTime
        },
        status: 'CONFIRMED'
      },
      select: {
        tableId: true,
        reservationDate: true,
        reservationTime: true
      }
    });

    // Generate available time slots (every 30 minutes from 11:00 to 22:00)
    const slots = [];
    for (let hour = 11; hour < 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = new Date(selectedDate);
        slotTime.setHours(hour, minute, 0, 0);

        // Check if at least one table of required capacity is available
        const availableTables = await prisma.table.findMany({
          where: {
            capacity: { gte: requiredCapacity },
            status: 'AVAILABLE'
          }
        });

        const isAvailable = availableTables.some(table => {
          const hasConflict = reservations.some(res => 
            res.tableId === table.id &&
            res.reservationDate <= slotTime &&
            res.reservationTime > slotTime
          );
          return !hasConflict;
        });

        if (isAvailable) {
          slots.push({
            time: slotTime,
            availableTables: availableTables.length
          });
        }
      }
    }

    res.status(200).json({
      status: 'OK',
      message: 'Available slots retrieved successfully',
      data: {
        date: selectedDate,
        capacity: requiredCapacity,
        slots: slots.slice(0, 20) // Limit to 20 slots
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch available slots',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Modify reservation (Admin only)
export const modifyReservation = async (req: authenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { guestCount, reservationDate, reservationTime, tableId } = req.body;

    const reservation = await prisma.reservation.findUnique({
      where: { id }
    });

    if (!reservation) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Reservation not found',
        timestamp: new Date().toISOString()
      });
    }

    if (reservation.status === 'CANCELLED') {
      return res.status(409).json({
        status: 'ERROR',
        message: 'Cannot modify cancelled reservation',
        timestamp: new Date().toISOString()
      });
    }

    const updatedData: any = {};

    if (guestCount) {
      updatedData.guestCount = parseInt(String(guestCount));
    }

    if (reservationDate) {
      updatedData.reservationDate = new Date(reservationDate);
    }

    if (reservationTime) {
      updatedData.reservationTime = new Date(reservationTime);
    }

    if (tableId) {
      updatedData.tableId = tableId;
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: updatedData,
      include: {
        table: true,
        user: { select: { id: true, name: true } }
      }
    });

    res.status(200).json({
      status: 'OK',
      message: 'Reservation modified successfully',
      data: updatedReservation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error modifying reservation:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to modify reservation',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Daily reservation log for operations/admin reporting
export const getDailyReservationLog = async (req: authenticatedRequest, res: Response) => {
  try {
    const dateParam = req.query.date as string | undefined;
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    const reservations = await prisma.reservation.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        table: {
          select: {
            id: true,
            tableNumber: true,
            capacity: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const summary = {
      total: reservations.length,
      confirmed: reservations.filter((r) => r.status === 'CONFIRMED').length,
      completed: reservations.filter((r) => r.status === 'COMPLETED').length,
      cancelled: reservations.filter((r) => r.status === 'CANCELLED').length,
      noShow: reservations.filter((r) => r.status === 'NO_SHOW').length
    };

    return res.status(200).json({
      status: 'OK',
      message: 'Daily reservation log retrieved successfully',
      data: {
        date: start.toISOString().split('T')[0],
        summary,
        reservations
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching daily reservation log:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch daily reservation log',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};
