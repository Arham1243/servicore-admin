export const timesheetStartOptions = [
    { name: 'Weekly', code: 'weekly' },
    { name: 'Daily', code: 'daily' }
];

export const timezones = [
    {
        name: '(UTC-05:00) Eastern Time (US & Canada)',
        code: 'America/New_York'
    },
    { name: '(UTC-06:00) Central Time (US & Canada)', code: 'America/Chicago' },
    { name: '(UTC-07:00) Mountain Time (US & Canada)', code: 'America/Denver' },
    {
        name: '(UTC-08:00) Pacific Time (US & Canada)',
        code: 'America/Los_Angeles'
    }
];

export const dateFormats = [
    { name: 'MM/DD/YYYY', code: 'mm/dd/yy' },
    { name: 'DD/MM/YYYY', code: 'dd/mm/yy' },
    { name: 'YYYY-MM-DD', code: 'yy-mm-dd' }
];

export const weeklyTimesheetDateDisplayOptions = [
    { name: 'MM/DD', code: 'mm/dd' },
    { name: 'DD/MM', code: 'dd/mm' }
];

export const weekDays = [
    { name: 'Sunday', code: 'SU' },
    { name: 'Monday', code: 'MO' },
    { name: 'Tuesday', code: 'TU' },
    { name: 'Wednesday', code: 'WE' },
    { name: 'Thursday', code: 'TH' },
    { name: 'Friday', code: 'FR' },
    { name: 'Saturday', code: 'SA' }
];

export const paymentTypes = [
    { name: 'Regular Invoice', code: 'regular_invoice' },
    { name: 'Prepayment', code: 'prepayment' }
];

export const quickbooksEnvironments = [
    { name: 'Sandbox', code: 'sandbox' },
    { name: 'Production', code: 'production' }
];

export const statusOptions = [
    { name: 'Active', code: true },
    { name: 'Inactive', code: false }
];

export const yesNoOptions = [
    { name: 'Yes', code: true },
    { name: 'No', code: false }
];

export const qboStatuses = [
    { id: 'posted', name: 'Posted' },
    { id: 'not_posted', name: 'Not Posted' }
];

export const expenseStatuses = [
    { id: 'draft', name: 'Draft' },
    { id: 'submitted', name: 'Submitted' },
    { id: 'approved', name: 'Approved' },
    { id: 'billed', name: 'Billed' }
];

export const timesheetStatuses = [
    { id: 'draft', name: 'Draft' },
    { id: 'submitted', name: 'Submitted' },
    { id: 'approved', name: 'Approved' },
    { id: 'billed', name: 'Billed' }
];

export const billingStatuses = [
    { id: 'unbilled', name: 'Unbilled' },
    { id: 'billed', name: 'Billed' }
];

export const invoiceStatuses = [
    { id: 'draft', name: 'Draft' },
    { id: 'approved', name: 'Approved' }
];

export const receiptStatuses = [
    { id: 'settled', name: 'Settled' },
    { id: 'declined', name: 'Declined' }
];

export const invoicesPaymentStatuses = [
    { id: 'unpaid', name: 'Unpaid' },
    { id: 'paid', name: 'Paid' },
    { id: 'partially_paid', name: 'Partially Paid' }
];
export const auditLogResources = [
    { id: 'project_task_template', name: 'Admin Project Task' },
    { id: 'company', name: 'Company' },
    { id: 'contact_type', name: 'Contact Type' },
    { id: 'credit_card', name: 'Credit Card' },
    { id: 'customer', name: 'Customer' },
    { id: 'customer_contact', name: 'Customer Contact' },
    { id: 'customer_user', name: 'Customer Teams' },
    { id: 'deduction_type', name: 'Deduction Type' },
    { id: 'email_template', name: 'Email Template' },
    { id: 'expense', name: 'Expense' },
    { id: 'expense_category', name: 'Expense Category' },
    { id: 'invoice', name: 'Invoice' },
    { id: 'invoice_template', name: 'Invoice Template' },
    { id: 'minimum_charge', name: 'Minimum Charge' },
    { id: 'payment_method', name: 'Payment Method' },
    { id: 'payment_term', name: 'Payment Term' },
    { id: 'project', name: 'Project' },
    { id: 'project_attachment', name: 'Project Attachment' },
    { id: 'project_task', name: 'Project Task' },
    { id: 'project_task_user', name: 'Project Task User' },
    { id: 'project_type', name: 'Project Type' },
    { id: 'revenue_category', name: 'Revenue Category' },
    { id: 'receipt', name: 'Receipt' },
    { id: 'timesheet', name: 'Timesheet' },
    { id: 'user', name: 'User' }
];
