import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'admin123',
    10
  );

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@xuanlv.ai' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@xuanlv.ai',
      name: '管理员',
      role: 'ADMIN',
    },
  });

  console.log(`Admin user created: ${admin.email}`);

  // Create a demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@xuanlv.ai' },
    update: {},
    create: {
      email: 'demo@xuanlv.ai',
      name: '演示用户',
      role: 'USER',
    },
  });

  console.log(`Demo user created: ${demoUser.email}`);

  // Create memberships for both users
  for (const user of [admin, demoUser]) {
    const existingMembership = await prisma.membership.findFirst({
      where: { userId: user.id, isActive: true },
    });

    if (!existingMembership) {
      await prisma.membership.create({
        data: {
          userId: user.id,
          tier: user.role === 'ADMIN' ? 'ENTERPRISE' : 'FREE',
          creditsRemaining: user.role === 'ADMIN' ? 9999 : 10,
          creditsTotal: user.role === 'ADMIN' ? 9999 : 10,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // Create default comic prompt
  const existingComicPrompt = await prisma.prompt.findFirst({
    where: { category: 'COMIC' },
  });

  if (!existingComicPrompt) {
    await prisma.prompt.create({
      data: {
        name: '默认漫画风格',
        description: '极简黑白手绘条漫风格，适用于新媒体内容创作',
        category: 'COMIC',
        systemPrompt: `极简黑白手绘条漫，单格漫画形式，纯白背景，粗黑马克笔线条，无渐变无纹理无多余装饰。人物为简化动作和表情夸张的火柴人形象（每个人物都要有自己名称的备注，可以生成到人物的脸上），带有简单男、女发型和夸张表情（比如皱眉、撇嘴、瞪眼睛、思考、难过、开心、愤怒、生气等等），按文案需求生成，用极简线条传递情绪。对话气泡和文字用简洁字体呈现，整体风格像随笔涂鸦，轻松吐槽风，画面干净，重点突出人物和情绪，高对比度。一定要以发型来区别男女，发型可以画得稍微抽象一些。`,
        model: 'gpt-image-2',
        isPublished: true,
      },
    });
    console.log('Default comic prompt created');
  }

  // Create default custom image prompt
  const existingCustomPrompt = await prisma.prompt.findFirst({
    where: { category: 'CUSTOM_IMAGE' },
  });

  if (!existingCustomPrompt) {
    await prisma.prompt.create({
      data: {
        name: '新媒体素材图',
        description: '适用于社交媒体、公众号等新媒体平台的高质量素材图',
        category: 'CUSTOM_IMAGE',
        systemPrompt: 'High quality new media content image, professional design, clean layout, suitable for social media platforms, vibrant colors, modern aesthetic',
        model: 'gpt-image-2',
        isPublished: true,
      },
    });
    console.log('Default custom image prompt created');
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
