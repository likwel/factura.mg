// apps/backend/prisma/seed.ts
import { PrismaClient, SubscriptionPlan } from '@prisma/client';

const prisma = new PrismaClient();

interface PlanFeatureData {
  plan: SubscriptionPlan;
  featureKey: string;
  featureName: string;
  limit: number | null;
  enabled?: boolean;
}

const planFeatures: PlanFeatureData[] = [
  // STARTER
  { plan: SubscriptionPlan.STARTER, featureKey: 'max_users', featureName: "Jusqu'à 5 utilisateurs", limit: 5 },
  { plan: SubscriptionPlan.STARTER, featureKey: 'unlimited_invoices', featureName: 'Factures illimitées', limit: null },
  { plan: SubscriptionPlan.STARTER, featureKey: 'basic_reports', featureName: 'Rapports basiques', limit: null },
  { plan: SubscriptionPlan.STARTER, featureKey: 'email_support', featureName: 'Support email', limit: null },
  { plan: SubscriptionPlan.STARTER, featureKey: 'mobile_app', featureName: 'Accès application mobile', limit: null },
  { plan: SubscriptionPlan.STARTER, featureKey: 'storage', featureName: '5Go de stockage', limit: 5 },

  // PROFESSIONAL
  { plan: SubscriptionPlan.PROFESSIONAL, featureKey: 'max_users', featureName: "Jusqu'à 25 utilisateurs", limit: 25 },
  { plan: SubscriptionPlan.PROFESSIONAL, featureKey: 'unlimited_invoices', featureName: 'Factures illimitées', limit: null },
  { plan: SubscriptionPlan.PROFESSIONAL, featureKey: 'advanced_analytics', featureName: 'Analyses avancées', limit: null },
  { plan: SubscriptionPlan.PROFESSIONAL, featureKey: 'priority_support', featureName: 'Support prioritaire', limit: null },
  { plan: SubscriptionPlan.PROFESSIONAL, featureKey: 'customization', featureName: 'Personnalisation', limit: null },
  { plan: SubscriptionPlan.PROFESSIONAL, featureKey: 'api_access', featureName: 'Accès API', limit: null },
  { plan: SubscriptionPlan.PROFESSIONAL, featureKey: 'storage', featureName: '50Go de stockage', limit: 50 },
  { plan: SubscriptionPlan.PROFESSIONAL, featureKey: 'multi_currency', featureName: 'Multi-devises', limit: null },
  { plan: SubscriptionPlan.PROFESSIONAL, featureKey: 'automated_workflows', featureName: 'Workflows automatisés', limit: null },

  // ENTERPRISE
  { plan: SubscriptionPlan.ENTERPRISE, featureKey: 'max_users', featureName: 'Utilisateurs illimités', limit: null },
  { plan: SubscriptionPlan.ENTERPRISE, featureKey: 'unlimited_invoices', featureName: 'Factures illimitées', limit: null },
  { plan: SubscriptionPlan.ENTERPRISE, featureKey: 'dedicated_infrastructure', featureName: 'Infrastructure dédiée', limit: null },
  { plan: SubscriptionPlan.ENTERPRISE, featureKey: '24_7_support', featureName: 'Support 24/7 téléphonique', limit: null },
  { plan: SubscriptionPlan.ENTERPRISE, featureKey: 'custom_development', featureName: 'Développement personnalisé', limit: null },
  { plan: SubscriptionPlan.ENTERPRISE, featureKey: 'onsite_training', featureName: 'Formation sur site', limit: null },
  { plan: SubscriptionPlan.ENTERPRISE, featureKey: 'storage', featureName: 'Stockage illimité', limit: null },
  { plan: SubscriptionPlan.ENTERPRISE, featureKey: 'sla_guarantee', featureName: 'Garantie SLA', limit: null },
  { plan: SubscriptionPlan.ENTERPRISE, featureKey: 'white_label', featureName: 'Option marque blanche', limit: null },
];

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.$connect();
  console.log('✅ Connected to database');

  console.log('📝 Seeding plan features...');

  for (const feature of planFeatures) {
    await prisma.planFeature.upsert({
      where: {
        plan_featureKey: {
          plan: feature.plan,
          featureKey: feature.featureKey
        }
      },
      update: {
        featureName: feature.featureName,
        enabled: true,
        limit: feature.limit
      },
      create: {
        plan: feature.plan,
        featureKey: feature.featureKey,
        featureName: feature.featureName,
        enabled: true,
        limit: feature.limit
      }
    });
  }

  const count = await prisma.planFeature.count();
  console.log(`✅ Successfully seeded ${count} plan features!`);

  // Afficher un résumé
  const starterCount = await prisma.planFeature.count({ where: { plan: SubscriptionPlan.STARTER } });
  const professionalCount = await prisma.planFeature.count({ where: { plan: SubscriptionPlan.PROFESSIONAL } });
  const enterpriseCount = await prisma.planFeature.count({ where: { plan: SubscriptionPlan.ENTERPRISE } });

  console.log(`📊 Summary:`);
  console.log(`   - STARTER: ${starterCount} features`);
  console.log(`   - PROFESSIONAL: ${professionalCount} features`);
  console.log(`   - ENTERPRISE: ${enterpriseCount} features`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });