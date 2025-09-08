# MRP Prototype - Local Database System

This prototype implements a comprehensive Material Requirements Planning (MRP) system for steel manufacturing with a local database using localStorage.

## Features

### Local Database System
- **Persistent Storage**: All data is stored locally in the browser using localStorage
- **Automatic Initialization**: Database automatically seeds with sample data on first run
- **Version Management**: Database versioning to handle schema updates
- **Data Export/Import**: Full database backup and restore functionality

### Entity Management
- **Customers**: Customer relationship management with contact details
- **Suppliers**: Supplier management with ratings and specialties
- **Quotations**: Customer quotes and proposals
- **Sales Orders**: Customer orders and delivery tracking
- **Engineering**: Project design and documentation
- **Bill of Materials**: Material requirements and specifications
- **Production**: Manufacturing and work orders
- **Invoicing**: Billing and payment tracking
- **Procurement**: Purchase orders and supplier management

## Database Architecture

### Core Components
- `lib/database.ts` - Main database class with CRUD operations
- `lib/hooks/useDatabase.ts` - React hooks for database state management
- `components/database-provider.tsx` - React context provider
- `components/database-manager.tsx` - Database management UI

### Data Persistence
- Uses browser localStorage for data storage
- Automatic data seeding from `lib/data.ts`
- JSON-based data format
- Automatic timestamp management (createdAt, updatedAt)

### CRUD Operations
Each entity type supports:
- **Create**: Add new records with auto-generated IDs
- **Read**: Retrieve single or multiple records
- **Update**: Modify existing records with timestamp updates
- **Delete**: Remove records with confirmation
- **Search**: Text-based search across multiple fields
- **Filter**: Status-based filtering

## Usage

### Basic Database Access
\`\`\`typescript
import { useDatabaseContext } from "@/components/database-provider"

function MyComponent() {
  const { useCustomers } = useDatabaseContext()
  const { customers, createCustomer, updateCustomer, deleteCustomer } = useCustomers()
  
  // Use the data and functions
}
\`\`\`

### Database Management
The dashboard includes a database manager component that provides:
- Database status monitoring
- Data export to JSON files
- Data import from JSON files
- Database clearing functionality

### Data Export/Import
- **Export**: Downloads all database data as a JSON file
- **Import**: Replaces all data with imported JSON (with confirmation)
- **Clear**: Removes all data (with confirmation)

## Technical Details

### Storage Keys
All data is stored with prefixed keys:
- `mrp_prototype_customers`
- `mrp_prototype_suppliers`
- `mrp_prototype_quotations`
- `mrp_prototype_sales_orders`
- `mrp_prototype_engineering_drawings`
- `mrp_prototype_bills_of_materials`
- `mrp_prototype_production_work_orders`
- `mrp_prototype_invoices`
- `mrp_prototype_purchase_orders`

### Data Validation
- TypeScript interfaces ensure data consistency
- Automatic ID generation for new records
- Timestamp management for audit trails
- Error handling for localStorage operations

### Performance Considerations
- Data is loaded on-demand using React hooks
- Automatic state updates when data changes
- Efficient filtering and search operations
- Minimal localStorage operations

## Browser Compatibility

- **Modern Browsers**: Full support for localStorage
- **Mobile Browsers**: Compatible with mobile Safari, Chrome, etc.
- **Storage Limits**: Typically 5-10MB per domain
- **Data Persistence**: Survives browser restarts and sessions

## Development

### Adding New Entities
1. Define the interface in `lib/types.ts`
2. Add CRUD methods in `lib/database.ts`
3. Create React hooks in `lib/hooks/useDatabase.ts`
4. Update the database provider if needed

### Data Migration
- Database versioning handles schema updates
- Export/import functionality for data migration
- Automatic seeding for new installations

## Security Notes

- **Local Storage**: Data is stored locally in the browser
- **No Server**: All operations happen client-side
- **User Control**: Users can export, import, or clear their data
- **Privacy**: Data never leaves the user's device

## Future Enhancements

- **IndexedDB**: For larger datasets and better performance
- **Data Encryption**: Optional encryption for sensitive data
- **Sync**: Cloud synchronization capabilities
- **Offline Support**: Enhanced offline functionality
- **Data Validation**: Enhanced input validation and sanitization

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install` or `pnpm install`
3. Run the development server: `npm run dev`
4. Open your browser and navigate to the application
5. The database will automatically initialize with sample data

The system is ready to use immediately with sample data, and you can start creating, editing, and managing your manufacturing data right away.
