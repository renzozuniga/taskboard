/**
 * Database Seed Script — TaskBoard by MAO Systems
 *
 * Clears all existing data and populates the database with
 * a demo user and three realistic Kanban boards.
 *
 * Usage:
 *   npm run seed
 *
 * Demo credentials after seeding:
 *   Email:    demo@taskboard.com
 *   Password: Demo123456
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User  = require('../models/User');
const Board = require('../models/Board');
const List  = require('../models/List');
const Card  = require('../models/Card');

// ─────────────────────────────────────────────────────────────────
// Seed data definition
// ─────────────────────────────────────────────────────────────────

const DEMO_USER = {
  name: 'Renzo Zúñiga',
  email: 'demo@taskboard.com',
  password: 'Demo123456',
};

const BOARDS = [
  {
    title: 'MAO Website',
    description: 'Portfolio and company landing page for MAO Systems',
    lists: [
      {
        title: 'Backlog',
        cards: [
          {
            title: 'Design hero section',
            description: 'Tagline, CTA button and animated headline. Reference: Vercel homepage style.',
          },
          {
            title: 'Write "About us" page',
            description: 'Company vision, team section and core values. Keep it under 300 words.',
          },
          {
            title: 'Configure Google Analytics 4',
            description: 'Add GA4 tracking tag and set up conversion goals for the contact form.',
          },
          {
            title: 'SEO — meta tags and OG images',
            description: 'Add title, description and Open Graph image for each page.',
          },
        ],
      },
      {
        title: 'In Progress',
        cards: [
          {
            title: 'Services page layout',
            description: 'Three service cards: Web Dev, Consulting, Maintenance. Use the design tokens grid.',
            assignee: { name: 'Renzo Zúñiga' },
          },
          {
            title: 'Mobile responsive navigation',
            description: 'Hamburger menu for screens under 768px. Test on iOS Safari and Android Chrome.',
            assignee: { name: 'Renzo Zúñiga' },
          },
        ],
      },
      {
        title: 'Review',
        cards: [
          {
            title: 'Contact form with email integration',
            description: 'Form sends email via Resend API. Validate fields and show success/error states.',
          },
        ],
      },
      {
        title: 'Done',
        cards: [
          {
            title: 'Domain and hosting setup',
            description: 'Registered mao.pe domain. Deployed to Vercel with custom domain.',
            assignee: { name: 'Renzo Zúñiga' },
          },
          {
            title: 'Initial design system',
            description: 'Colors, typography, spacing tokens defined in Figma and exported to CSS variables.',
            assignee: { name: 'Renzo Zúñiga' },
          },
        ],
      },
    ],
  },

  {
    title: 'E-commerce Client',
    description: 'Online store development for a retail client in Lima',
    lists: [
      {
        title: 'To Do',
        cards: [
          {
            title: 'Payment gateway integration',
            description: 'Integrate Culqi (Peru) as the primary payment processor. Handle 3DS flows.',
          },
          {
            title: 'Product search with filters',
            description: 'Filter by category, price range and stock. Use Elasticsearch or MongoDB text index.',
          },
          {
            title: 'Order confirmation emails',
            description: 'Transactional email template with order summary, delivery estimate and tracking link.',
          },
        ],
      },
      {
        title: 'In Progress',
        cards: [
          {
            title: 'Shopping cart — persist to localStorage',
            description: 'Cart items should survive page reloads. Sync with server when user logs in.',
            assignee: { name: 'Renzo Zúñiga' },
          },
          {
            title: 'Product detail page',
            description: 'Image gallery, size selector, add-to-cart button, stock indicator.',
            assignee: { name: 'Renzo Zúñiga' },
          },
        ],
      },
      {
        title: 'Testing',
        cards: [
          {
            title: 'Checkout flow end-to-end',
            description: 'Test full purchase cycle: cart → address → payment → confirmation. Cover edge cases.',
          },
          {
            title: 'Load testing — 500 concurrent users',
            description: 'Use k6 to simulate 500 concurrent users on the product listing page.',
          },
        ],
      },
      {
        title: 'Deployed',
        cards: [
          {
            title: 'User authentication (register / login)',
            description: 'JWT-based auth with refresh tokens. Password reset via email.',
            assignee: { name: 'Renzo Zúñiga' },
          },
          {
            title: 'Product catalog with pagination',
            description: 'Grid view with lazy-loaded images. 24 products per page with infinite scroll option.',
            assignee: { name: 'Renzo Zúñiga' },
          },
          {
            title: 'Admin panel — product management',
            description: 'CRUD for products, categories and inventory. Role-based access control.',
            assignee: { name: 'Renzo Zúñiga' },
          },
        ],
      },
    ],
  },

  {
    title: 'MAO Internal Tools',
    description: 'Internal productivity tools and automations for the team',
    lists: [
      {
        title: 'Ideas',
        cards: [
          {
            title: 'Client onboarding portal',
            description: 'Self-service portal where clients upload requirements, sign contracts and track project status.',
          },
          {
            title: 'Automated invoice generator',
            description: 'Generate and send PDF invoices from project data. Integrate with Notion or a CRM.',
          },
          {
            title: 'Time tracker Chrome extension',
            description: 'Simple extension to log hours per project with one click. Sync to Google Sheets.',
          },
        ],
      },
      {
        title: 'In Progress',
        cards: [
          {
            title: 'Project proposal template system',
            description: 'Reusable templates for web, app and consulting proposals. Export to PDF.',
            assignee: { name: 'Renzo Zúñiga' },
          },
        ],
      },
      {
        title: 'Done',
        cards: [
          {
            title: 'TaskBoard — this app!',
            description: 'Kanban board built with Angular 17 + Node.js + MongoDB. Portfolio project for MAO Systems.',
            assignee: { name: 'Renzo Zúñiga' },
          },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// Seed execution
// ─────────────────────────────────────────────────────────────────

async function clearDatabase() {
  await Card.deleteMany({});
  await List.deleteMany({});
  await Board.deleteMany({});
  await User.deleteMany({});
  console.log('✓ Database cleared');
}

async function seedUser() {
  // The pre-save hook on the User model handles bcrypt hashing automatically
  const user = await User.create(DEMO_USER);
  console.log(`✓ User created  →  ${user.email}`);
  return user;
}

async function seedBoards(owner) {
  for (const [boardIndex, boardData] of BOARDS.entries()) {
    const board = await Board.create({
      title: boardData.title,
      description: boardData.description,
      owner: owner._id,
    });

    for (const [listIndex, listData] of boardData.lists.entries()) {
      const list = await List.create({
        title: listData.title,
        board: board._id,
        position: listIndex,
      });

      for (const [cardIndex, cardData] of listData.cards.entries()) {
        await Card.create({
          title: cardData.title,
          description: cardData.description || '',
          list: list._id,
          position: cardIndex,
          assignee: cardData.assignee || null,
        });
      }

      const cardCount = listData.cards.length;
      console.log(`    └─ "${listData.title}" (${cardCount} card${cardCount !== 1 ? 's' : ''})`);
    }

    console.log(`✓ Board [${boardIndex + 1}/${BOARDS.length}]  →  "${board.title}"`);
  }
}

async function run() {
  try {
    console.log('\n── TaskBoard Seed ──────────────────────────────────\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    await clearDatabase();
    console.log('');

    const user = await seedUser();
    console.log('');

    await seedBoards(user);

    console.log('\n────────────────────────────────────────────────────');
    console.log('  Seed completed successfully!\n');
    console.log('  Demo credentials:');
    console.log(`    Email:    ${DEMO_USER.email}`);
    console.log(`    Password: ${DEMO_USER.password}`);
    console.log('────────────────────────────────────────────────────\n');

  } catch (error) {
    console.error('\n✗ Seed failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
