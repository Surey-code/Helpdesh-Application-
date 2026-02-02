// Export tickets to CSV
export const exportTicketsToCSV = (tickets, filename = 'tickets.csv') => {
  if (!tickets || tickets.length === 0) {
    return;
  }

  // Define CSV headers
  const headers = ['ID', 'Subject', 'Status', 'Priority', 'Customer', 'Assigned Agent', 'Created At', 'SLA Breached'];
  
  // Convert tickets to CSV rows
  const rows = tickets.map((ticket) => {
    return [
      ticket.id,
      `"${(ticket.subject || '').replace(/"/g, '""')}"`,
      ticket.status || '',
      ticket.priority || '',
      ticket.customer?.name || '',
      ticket.assignedAgent?.name || 'Unassigned',
      ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '',
      ticket.slaBreached ? 'Yes' : 'No',
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// Export reports data to CSV
export const exportReportsToCSV = (data, filename = 'reports.csv') => {
  if (!data) {
    return;
  }

  const rows = [];
  
  // Add summary stats
  rows.push(['Metric', 'Value']);
  rows.push(['Total Tickets', data.totalTickets || 0]);
  rows.push(['SLA Breached', data.slaBreachedCount || 0]);
  rows.push(['']);
  
  // Add status counts
  rows.push(['Status', 'Count']);
  if (data.statusCounts) {
    Object.entries(data.statusCounts).forEach(([status, count]) => {
      rows.push([status, count]);
    });
  }
  rows.push(['']);
  
  // Add priority counts
  rows.push(['Priority', 'Count']);
  if (data.priorityCounts) {
    Object.entries(data.priorityCounts).forEach(([priority, count]) => {
      rows.push([priority, count]);
    });
  }

  const csvContent = rows.map((row) => row.join(',')).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
