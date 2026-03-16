
export const emailTemplates = {
    confirmation: {
      subject: `Booking Confirmed - ${selectedBooking?.bookingNumber || ''}`,
      body: `Dear {customerName},

Your repair booking has been confirmed!

Booking Details:
- Booking Number: {bookingNumber}
- Device: {deviceName}
- Repair Type: {repairType}
- Date: {date}
- Time: {timeSlot}
- Location: {location}

Thank you for choosing TechFix Pro!

Best regards,
TechFix Pro Team`
    },
    reminder: {
      subject: `Reminder: Upcoming Repair - ${selectedBooking?.bookingNumber || ''}`,
      body: `Dear {customerName},

This is a reminder of your upcoming repair appointment:

Date: {date}
Time: {timeSlot}
Device: {deviceName}
Location: {location}

We look forward to seeing you!

TechFix Pro Team`
    },
    rejection: {
      subject: `Booking Update - ${selectedBooking?.bookingNumber || ''}`,
      body: `Dear {customerName},

We regret to inform you that we are unable to proceed with your booking at this time.

Booking Number: {bookingNumber}

If you have any questions, please don't hesitate to contact us.

Best regards,
TechFix Pro Team`
    },
    completed: {
      subject: `Repair Completed - ${selectedBooking?.bookingNumber || ''}`,
      body: `Dear {customerName},

Your device repair has been completed successfully!

Device: {deviceName}
Repair: {repairType}

You can pick up your device during our business hours.

Thank you for choosing TechFix Pro!`
    }
  };