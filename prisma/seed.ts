import { PrismaClient, Role, MemberRole, MembershipStatus, PostType, MemoryCategory, ContentStatus, CulturalCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Hometown Hub Database Seeding...');

  const passwordHash = await bcrypt.hash('Hometown2026!', 10);

  // 1. Create Default Users & Roles
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hometownhub.com' },
    update: {},
    create: {
      email: 'admin@hometownhub.com',
      passwordHash,
      name: 'Vikramaditya Rao',
      role: Role.PLATFORM_ADMIN,
      profile: {
        create: {
          bio: 'Founder & Community Curator of Hometown Hub. Passionate about historical preservation.',
          hometownCity: 'Panipat',
          hometownState: 'Haryana',
          currentCity: 'Delhi',
          currentState: 'Delhi',
          profession: 'Cultural Architect',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          coverUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          interests: ['History', 'Textiles', 'Architecture', 'Community Building']
        }
      }
    }
  });

  const panditUser = await prisma.user.upsert({
    where: { email: 'pandit@hometownhub.com' },
    update: {},
    create: {
      email: 'pandit@hometownhub.com',
      passwordHash,
      name: 'Pandit Devrat Sharma',
      role: Role.PANDIT,
      profile: {
        create: {
          bio: 'Verified Cultural Scholar & Heritage Researcher of Panipat & North Indian Traditions.',
          hometownCity: 'Panipat',
          hometownState: 'Haryana',
          currentCity: 'Panipat',
          currentState: 'Haryana',
          profession: 'Cultural Historian',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
          interests: ['Folk Music', 'Heritage Walks', 'Ancient Manuscripts', 'Festivals']
        }
      },
      panditProfile: {
        create: {
          name: 'Pandit Devrat Sharma',
          hometown: 'Panipat',
          expertise: 'Vedic Rituals, Haryanvi Folk Lore, GT Road History',
          languages: ['Hindi', 'Haryanvi', 'Sanskrit', 'English'],
          traditions: ['Sanatan Traditions', 'Textile Weaving History', 'Basant Panchami Lore'],
          bio: '40 years of dedicated archival research on North Indian heritage and community customs.',
          status: ContentStatus.APPROVED
        }
      }
    }
  });

  const normalUser = await prisma.user.upsert({
    where: { email: 'priya@hometownhub.com' },
    update: {},
    create: {
      email: 'priya@hometownhub.com',
      passwordHash,
      name: 'Priya Rathore',
      role: Role.USER,
      profile: {
        create: {
          bio: 'Living in Bengaluru, roots deep in Jaipur & Panipat. Memory collector.',
          hometownCity: 'Jaipur',
          hometownState: 'Rajasthan',
          currentCity: 'Bengaluru',
          currentState: 'Karnataka',
          profession: 'UI Designer & Writer',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          interests: ['Photography', 'Heritage Maps', 'Street Food']
        }
      }
    }
  });

  console.log('✅ Users & Profiles created.');

  // 2. Create Communities
  const panipatComm = await prisma.community.upsert({
    where: { slug: 'panipat' },
    update: {},
    create: {
      slug: 'panipat',
      name: 'Panipat Heritage & Community Hub',
      city: 'Panipat',
      district: 'Panipat',
      state: 'Haryana',
      country: 'India',
      description: 'The historic City of Weavers and Battles. Reconnect with Panipat’s rich textile legacy, GT Road memories, and vibrant community initiatives.',
      coverUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      avatarUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=200&q=80',
      isVerified: true,
      createdById: adminUser.id,
      memberships: {
        create: [
          { userId: adminUser.id, role: MemberRole.ADMIN, status: MembershipStatus.APPROVED },
          { userId: panditUser.id, role: MemberRole.MODERATOR, status: MembershipStatus.APPROVED },
          { userId: normalUser.id, role: MemberRole.MEMBER, status: MembershipStatus.APPROVED }
        ]
      },
      rules: {
        create: [
          { title: 'Be Respectful & Welcoming', description: 'Treat fellow hometown members with dignity.', orderIndex: 1 },
          { title: 'Preserve Authentic Memory', description: 'Share historical photos and true local stories.', orderIndex: 2 }
        ]
      }
    }
  });

  const jaipurComm = await prisma.community.upsert({
    where: { slug: 'jaipur' },
    update: {},
    create: {
      slug: 'jaipur',
      name: 'Jaipur Pink City Collective',
      city: 'Jaipur',
      district: 'Jaipur',
      state: 'Rajasthan',
      country: 'India',
      description: 'Celebrating the royal archways, block prints, food traditions, and vibrant diaspora of Rajasthan’s capital city.',
      coverUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
      avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80',
      isVerified: true,
      createdById: adminUser.id,
      memberships: {
        create: [
          { userId: normalUser.id, role: MemberRole.ADMIN, status: MembershipStatus.APPROVED }
        ]
      }
    }
  });

  console.log('✅ Communities created.');

  // 3. Create Memories & Media for Memory Map
  await prisma.memory.createMany({
    data: [
      {
        communityId: panipatComm.id,
        authorId: adminUser.id,
        title: 'Kabul Bagh Mosque & Babur’s Garden',
        story: 'Built in 1527 by Babur after his victory in the First Battle of Panipat. As a child, my grandfather used to walk us through the ancient red sandstone archways.',
        category: MemoryCategory.HISTORIC,
        year: 1968,
        latitude: 29.3989,
        longitude: 76.9685,
        address: 'Kabul Bagh, Old Panipat, Haryana',
        status: ContentStatus.APPROVED,
        isVerified: true,
        likesCount: 142
      },
      {
        communityId: panipatComm.id,
        authorId: panditUser.id,
        title: 'Salim Shah Tomb & Local Heritage Walk',
        story: 'Every Basant Panchami, local elders gather here to recite poetry and remember the oral folk songs of Haryana.',
        category: MemoryCategory.HERITAGE,
        year: 1995,
        latitude: 29.3950,
        longitude: 76.9720,
        address: 'Near Old Fort Grounds, Panipat',
        status: ContentStatus.APPROVED,
        isVerified: true,
        likesCount: 96
      },
      {
        communityId: jaipurComm.id,
        authorId: normalUser.id,
        title: 'Hawa Mahal Sunrise & Milk Tea Tradition',
        story: 'For generations, sunrise at Hawa Mahal was incomplete without Sahu’s hot spiced chai in clay kulhads.',
        category: MemoryCategory.FOOD,
        year: 1992,
        latitude: 26.9239,
        longitude: 75.8267,
        address: 'Hawa Mahal Rd, Badi Choupad, Jaipur',
        status: ContentStatus.APPROVED,
        isVerified: true,
        likesCount: 310
      }
    ]
  });

  console.log('✅ Memories created.');

  // 4. Create Events
  await prisma.event.create({
    data: {
      communityId: panipatComm.id,
      organizerId: adminUser.id,
      title: 'Annual Panipat Weavers & Heritage Festival 2026',
      description: 'Join us for a 3-day celebration of Panipat handlooms, live artisan demonstrations, traditional Haryana folk music, and a historic food bazaar!',
      coverUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      category: 'Cultural Festival',
      venue: 'Sector 12 Craft Fair Grounds',
      location: 'Panipat, Haryana',
      startDate: new Date('2026-09-10T10:00:00Z'),
      endDate: new Date('2026-09-12T20:00:00Z'),
      capacity: 500,
      attendees: {
        create: [
          { userId: normalUser.id },
          { userId: panditUser.id }
        ]
      }
    }
  });

  console.log('✅ Events created.');

  // 5. Create Posts & Announcements
  await prisma.post.create({
    data: {
      communityId: panipatComm.id,
      authorId: panditUser.id,
      title: 'Documenting GT Road Oral Stories - Call for Submissions',
      content: 'We are compiling oral histories from elders who remember Panipat between 1950 and 1990. Please post your photos or family anecdotes on the Hometown Memory Map™!',
      type: PostType.ANNOUNCEMENT,
      isPinned: true,
      comments: {
        create: [
          { authorId: normalUser.id, content: 'My grandfather has rare photographs of the old yarn market from 1965! Will upload today.' }
        ]
      }
    }
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
