const readline = require('readline');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');

const askQuestion = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    })
  );
};

const parseArgs = () => {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      args[key] = value;
    }
  });
  return args;
};

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ Error: MONGODB_URI is not set in .env file.');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const cliArgs = parseArgs();

    let name = cliArgs.name;
    let email = cliArgs.email;
    let password = cliArgs.password;

    if (!name) {
      name = await askQuestion('Admin name: ');
    }
    if (!email) {
      email = await askQuestion('Admin email: ');
    }
    if (!password) {
      password = await askQuestion('Admin password: ');
    }

    if (!name || !email || !password) {
      console.error('❌ Name, email, and password are all required to create an admin account.');
      await mongoose.disconnect();
      process.exit(1);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log(`⚠️ User ${email} is already registered as an Admin.`);
      } else {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log(`✅ User ${email} role upgraded to Admin successfully!`);
      }
      await mongoose.disconnect();
      process.exit(0);
    }

    const adminUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'admin',
    });

    console.log(`\n🎉 Admin account successfully created!`);
    console.log(`-----------------------------------`);
    console.log(`ID:       ${adminUser._id}`);
    console.log(`Name:     ${adminUser.name}`);
    console.log(`Email:    ${adminUser.email}`);
    console.log(`Role:     ${adminUser.role}`);
    console.log(`-----------------------------------\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message);
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
};

createAdmin();
