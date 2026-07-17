import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// ==========================================
// 1. MONGOOSE SCHEMA & MODEL SETUP
// ==========================================
const settingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: 'BlogCMS',
    },
    siteLogo: {
      type: String,
      default: '',
    },
    favicon: {
      type: String,
      default: '',
    },
    contactEmail: {
      type: String,
      default: 'admin@blogcms.com',
    },
    footerText: {
      type: String,
      default: '© 2026 BlogCMS. All rights reserved.',
    },
    socialFacebook: {
      type: String,
      default: '',
    },
    socialTwitter: {
      type: String,
      default: '',
    },
    socialGithub: {
      type: String,
      default: '',
    },
    socialLinkedin: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const MongooseSettings = mongoose.model('Settings', settingsSchema);

// ==========================================
// 2. MOCK JSON DATABASE SETUP
// ==========================================
const DATA_DIR = path.resolve('data');
const DATA_FILE = path.join(DATA_DIR, 'settings.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Pre-seed default settings
const seedDefaultSettings = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const defaultSettings = {
      _id: 'site_settings_default',
      siteName: 'BlogCMS',
      siteLogo: '',
      favicon: '',
      contactEmail: 'admin@blogcms.com',
      footerText: '© 2026 BlogCMS. All rights reserved.',
      socialFacebook: '',
      socialTwitter: '',
      socialGithub: '',
      socialLinkedin: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultSettings, null, 2));
  }
};

const loadMockSettings = () => {
  seedDefaultSettings();
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};

const saveMockSettings = (settings) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(settings, null, 2));
};

// ==========================================
// 3. DYNAMIC WRAPPER INTERFACE (PROXY)
// ==========================================
class SettingsWrapper {
  static async findOne() {
    if (global.useMockDb) {
      return loadMockSettings();
    } else {
      let settings = await MongooseSettings.findOne();
      if (!settings) {
        settings = await MongooseSettings.create({
          siteName: 'BlogCMS',
          contactEmail: 'admin@blogcms.com',
          footerText: '© 2026 BlogCMS. All rights reserved.',
        });
      }
      return settings;
    }
  }

  static async findOneAndUpdate(query, updateData, options = {}) {
    if (global.useMockDb) {
      const current = loadMockSettings();
      const updated = {
        ...current,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      saveMockSettings(updated);
      return updated;
    } else {
      // Find one or create first, then update
      let settings = await MongooseSettings.findOne();
      if (!settings) {
        settings = await MongooseSettings.create({
          siteName: 'BlogCMS',
        });
      }
      return await MongooseSettings.findOneAndUpdate({ _id: settings._id }, updateData, {
        new: true,
        ...options,
      });
    }
  }
}

export default SettingsWrapper;
export { MongooseSettings };
