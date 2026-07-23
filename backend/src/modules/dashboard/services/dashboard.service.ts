import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ChartData, MetricCard } from '../interfaces/metric-card.interface';
import { buildMetricCard } from 'src/shared/utils/metric.util';
import { CollectionTrendPoint } from '../interfaces/chart.interface';
import { LoginTrendPoint } from '../interfaces/login-trend.interfaces';

interface TagihanSumRow {
    total: string | null;
}

type RangeOption = '7d' | '30d' | '90d';

interface TrendRow {
    date: Date;
    outstanding: string | null;
    tagihan: string | null;
}

interface LoginTrendRow {
    date: Date;
    success: bigint;
    failed: bigint;
}

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    private getMonthRange(offsetMonths = 0) {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - offsetMonths, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - offsetMonths + 1, 1);
        return { start, end };
    }

    private rangeToDays(range: RangeOption): number {
        switch (range) {
            case '7d':
                return 7;
            case '30d':
                return 30;
            case '90d':
            default:
                return 90;
        }
    }

    async getSummaryCards(): Promise<MetricCard[]> {
        const thisMonth = this.getMonthRange(0);
        const lastMonth = this.getMonthRange(1);
        const [
            totalKreditNow,
            totalKreditPrev,
        ] = await Promise.all([
            this.sumTagihan(thisMonth.start, thisMonth.end),
            this.sumTagihan(lastMonth.start, lastMonth.end),
        ]);

        return [
            buildMetricCard('Total Kredit', totalKreditNow, totalKreditPrev),
        ];
    }

    private async sumTagihan(start: Date, end: Date): Promise<number> {
        const result = await this.prisma.$queryRaw<TagihanSumRow[]>`
      SELECT SUM(base + interest + penalty) AS total
      FROM collection
      WHERE createdat >= ${start}
        AND createdat < ${end}
        AND status != 'COMPLETED'
    `;

        const total = result[0]?.total;
        return total ? Number(total) : 0;
    }

  

    async getCollectionTrend(range: RangeOption = '90d'): Promise<CollectionTrendPoint[]> {
        const days = this.rangeToDays(range);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const rows = await this.prisma.$queryRaw<TrendRow[]>`
      SELECT
        DATE(last_activity_at) AS date,
        SUM(outstanding) AS outstanding,
        SUM(base + interest + penalty) AS tagihan
      FROM collection
      WHERE last_activity_at >= ${startDate}
        AND status = 'ACTIVE'
      GROUP BY DATE(last_activity_at)
      ORDER BY DATE(last_activity_at) ASC
    `;

        return rows.map((row) => ({
            date: row.date.toISOString().split('T')[0],
            outstanding: row.outstanding ? Number(row.outstanding) : 0,
            tagihan: row.tagihan ? Number(row.tagihan) : 0,
        }));
    }

    async getLoginTrend(range: RangeOption = '90d'): Promise<LoginTrendPoint[]> {
        const days = this.rangeToDays(range);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const rows = await this.prisma.$queryRaw<LoginTrendRow[]>`
      SELECT
        DATE(login_at) AS date,
        COUNT(*) FILTER (WHERE status = 'SUCCESS') AS success,
        COUNT(*) FILTER (WHERE status = 'FAILED') AS failed
      FROM login_history
      WHERE login_at >= ${startDate}
      GROUP BY DATE(login_at)
      ORDER BY DATE(login_at) ASC
    `;

        return rows.map((row) => ({
            date: row.date.toISOString().split('T')[0],
            success: Number(row.success),
            failed: Number(row.failed),
        }));
    }
}