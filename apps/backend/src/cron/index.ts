import cron from 'node-cron';
import { prisma } from '../index';
import { io } from '../index';

export const startCronJobs = () => {
  cron.schedule('0 * * * *', async () => {
    const lowStockArticles = await prisma.article.findMany({
      where: { currentStock: { lte: prisma.article.fields.stockMin } },
      include: { company: true }
    });

    for (const article of lowStockArticles) {
      await prisma.notification.create({
        data: {
          companyId: article.companyId,
          type: 'STOCK_ALERT',
          title: 'Stock faible',
          message: `L'article ${article.name} est en stock faible`,
          data: { articleId: article.id }
        }
      });
      
      io.to(`company:${article.companyId}`).emit('notification:new', {
        type: 'STOCK_ALERT',
        message: `Stock faible: ${article.name}`
      });
    }
  });

  console.log('✅ Cron jobs démarrés');
};
