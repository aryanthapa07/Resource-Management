require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    isActive: true
  },
  {
    name: 'John Smith',
    email: 'john@example.com',
    password: 'password123',
    role: 'engagement_manager',
    isActive: true,
    profile: {
      skills: ['Project Management', 'Client Relations'],
      experience: 5
    }
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    password: 'password123',
    role: 'resource_manager',
    isActive: true,
    profile: {
      skills: ['Resource Planning', 'Team Management'],
      experience: 3
    }
  }
];

async function createUsers() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Clear existing users (optional - comment out if you want to keep existing users)
    // await User.deleteMany({});
    // console.log('Cleared existing users');

    // Check if users already exist
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create user
      const user = new User({
        ...userData,
        password: hashedPassword
      });

      await user.save();
      console.log(`Created user: ${userData.email} (${userData.role})`);
    }

    console.log('\nTest users created successfully!');
    console.log('\nYou can now login with any of these accounts:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Engagement Manager: john@example.com / password123');
    console.log('Resource Manager: sarah@example.com / password123');

  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

createUsers();