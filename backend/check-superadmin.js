// const prisma = require('./src/config/database');

// (async () => {
//   try {
//     const user = await prisma.user.findUnique({
//       where: { email: 'admin@resolvehubgh.com' }
//     });
    
//     if (user) {
//       console.log('✅ Super-admin user found:');
//       console.log(JSON.stringify({
//         id: user.id,
//         email: user.email,
//         role: user.role,
//         isActive: user.isActive,
//         hasPasswordHash: !!user.passwordHash
//       }, null, 2));
//     } else {
//       console.log('❌ Super-admin user NOT found in database');
//     }
//   } catch (error) {
//     console.error('Error checking database:', error.message);
//   } finally {
//     await prisma.$disconnect();
//   }
// })();
