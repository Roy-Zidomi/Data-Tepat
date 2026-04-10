const prisma = require('../config/database');
const { calculateTotalScore, determinePriorityLevel } = require('../utils/scoring');
const { logAudit } = require('../utils/auditLogger');

class ScoringService {
  async calculateScore(householdId, applicationId, userId) {
    // Get all relevant data
    const household = await prisma.household.findUnique({
      where: { id: BigInt(householdId) },
      include: {
        economicCondition: true,
        housingCondition: true,
        householdAsset: true,
        vulnerability: true
      }
    });

    if (!household) throw new Error('Household not found for scoring');

    const scoreData = calculateTotalScore({
      economicCond: household.economicCondition,
      housingCond: household.housingCondition,
      assets: household.householdAsset,
      vulnerability: household.vulnerability
    });

    const priorityLevel = determinePriorityLevel(scoreData.totalScore);

    return prisma.$transaction(async (tx) => {
      const scoringResult = await tx.scoringResult.create({
        data: {
          application_id: BigInt(applicationId),
          income_score: scoreData.incomeScore,
          dependents_score: scoreData.dependentsScore,
          housing_score: scoreData.housingScore,
          asset_score: scoreData.assetScore,
          vulnerability_score: scoreData.vulnerabilityScore,
          history_aid_score: scoreData.historyAidScore,
          total_score: scoreData.totalScore,
          priority_level: priorityLevel,
          scoring_version: '1.0.0',
          scored_by_user_id: BigInt(userId),
          score_note: `Automated scoring completed synchronously on submission`
        }
      });

      await logAudit({
        userId,
        action: 'create',
        entityType: 'ScoringResult',
        entityId: scoringResult.id,
        reason: 'Generated automated scoring result'
      });

      return scoringResult;
    });
  }
}

module.exports = new ScoringService();
