import React from 'react';

import { LineChart, PieChart } from 'react-native-chart-kit';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

import { InsightNodeType } from '../type/InsightType';

import {
  Pressable,
  View,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import {
  Text,
  Portal,
  Surface,
  Divider,
  useTheme,
} from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';

export default function AnalyticsBottomSheet({
  visible,
  setVisible,
  insights,
  totalInsights,
  segregatedInsights,
}: {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  totalInsights: number;
  insights: InsightNodeType[],
  segregatedInsights: Record<string, InsightNodeType[]>;
}) {
  const theme = useTheme();
  const screenWidth = Dimensions.get('window').width;

  const donutData = [
    {
      name: 'Observation',
      count: segregatedInsights.observation.length ?? 0,
      color: '#3B82F6',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Insight',
      count: segregatedInsights.insight.length ?? 0,
      color: '#8B5CF6',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Actionable',
      count: segregatedInsights.actionable.length ?? 0,
      color: '#F59E0B',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Impact',
      count: segregatedInsights.impact.length ?? 0,
      color: '#10B981',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
  ];
  const funnelStages = [
    {
      label: 'Observation',
      value: segregatedInsights.observation.length ?? 0,
      color: '#3B82F6',
    },
    {
      label: 'Insight',
      value: segregatedInsights.insight.length ?? 0,
      color: '#8B5CF6',
    },
    {
      label: 'Actionable',
      value: segregatedInsights.actionable.length ?? 0,
      color: '#F59E0B',
    },
    {
      label: 'Impact',
      value: segregatedInsights.impact.length ?? 0,
      color: '#10B981',
    },
  ];

  const buildWeeklyChartData = (
    insights: InsightNodeType[]
  ) => {
    const weeks = Array.from({ length: 8 }).map((_, index) => {
      const week = dayjs()
        .subtract(7 - index, 'week');

      return {
        label: week.format('MMM D'),
        start: week.startOf('week'),
        end: week.endOf('week'),
      };
    });

    const counts = weeks.map((week) => {
      return insights.filter((insight) => {
        const createdAt = dayjs(insight.node.createdAt);

        return (
          createdAt.isAfter(week.start) &&
          createdAt.isBefore(week.end)
        );
      }).length;
    });

    return {
      labels: weeks.map((w) => w.label),
      datasets: [
        {
          data: counts,
        },
      ],
    };
  };
  const lineChartData = buildWeeklyChartData(insights);

  return (
    <Portal>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => {
          setVisible(false);
        }}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setVisible(false)}
        >
          <Pressable style={styles.sheetWrapper}>
            <Surface id="sheet" style={styles.sheet} elevation={1}>
              <View id="handle" style={styles.handle} />

              {/* TITLE */}
              <Text variant="titleLarge" style={{ marginBottom: 4, }}>
                Analytics
              </Text>
              <Divider style={{ marginVertical: 12, }} />

              <ScrollView
                contentContainerStyle={{
                  paddingBottom: 32,
                }}
                showsVerticalScrollIndicator={false}
              >
                {/* KPI CARDS */}
                <View style={[styles.kpiRow, { justifyContent: 'space-between', alignItems: 'center' }]}>
                  <Text style={styles.kpiLabel}>Total Insights</Text>
                  <Text style={styles.kpiValue}>{totalInsights}</Text>
                </View>
                <View style={styles.kpiRow}>
                  <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Observation</Text>
                    <Text style={styles.kpiValue}>
                      {segregatedInsights.observation.length}
                    </Text>
                  </View>

                  <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Insight</Text>
                    <Text style={styles.kpiValue}>
                      {segregatedInsights.insight.length}
                    </Text>
                  </View>
                </View>
                <View style={styles.kpiRow}>
                  <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Actionable</Text>
                    <Text style={styles.kpiValue}>
                      {segregatedInsights.actionable.length}
                    </Text>
                  </View>

                  <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Impact</Text>
                    <Text style={styles.kpiValue}>
                      {segregatedInsights.impact.length}
                    </Text>
                  </View>
                </View>

                {/* PIE CHART */}
                <View style={{ flex: 1, position: 'relative' }}>
                  <PieChart
                    data={donutData.map((item) => ({
                      name: item.name,
                      population: item.count,
                      color: item.color,
                      legendFontColor: item.legendFontColor,
                      legendFontSize: item.legendFontSize,
                    }))}
                    width={screenWidth * 0.7}
                    height={220}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="20"
                    hasLegend={false}
                    center={[0, 0]}
                    absolute
                    chartConfig={{
                      color: () => '#111827',
                    }}
                  />

                  {/* custom legend */}
                  <View style={styles.legendContainer}>
                    {donutData.map((item) => (
                      <View
                        key={item.name}
                        style={styles.legendRow}
                      >
                        <View
                          style={[
                            styles.legendColor,
                            {
                              backgroundColor: item.color,
                            },
                          ]}
                        />

                        <Text style={styles.legendText}>
                          {item.name} ({item.count})
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* INSIGHTS LINE CHART */}
                <View style={styles.insightsChartCard}>
                  <Text style={styles.insightsSectionTitle}>
                    Insights Over Time
                  </Text>

                  <LineChart
                    data={lineChartData}
                    width={screenWidth - 4}
                    height={240}
                    withInnerLines={false}
                    withOuterLines={false}
                    withShadow={false}
                    fromZero
                    bezier
                    yAxisInterval={1}
                    chartConfig={{
                      backgroundGradientFrom: '#333',
                      backgroundGradientTo: '#333',

                      decimalPlaces: 0,

                      color: (opacity = 1) =>
                        `rgba(59,130,246,${opacity})`,

                      labelColor: () => '#fff',
                      propsForHorizontalLabels: {
                        fontSize: 12,
                      },

                      propsForDots: {
                        r: '5',
                        strokeWidth: '2',
                        stroke: '#3B82F6',
                      },

                      propsForBackgroundLines: {
                        stroke: '#fff',
                      },
                    }}
                    style={{
                      marginTop: 12,
                      marginLeft: -36,
                    }}
                  />
                </View>
              </ScrollView>
            </Surface>
          </Pressable>
        </Pressable>
      </Modal>
    </Portal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.50)',
  },

  sheetWrapper: {
    width: '100%',
  },

  sheet: {
    backgroundColor: '#1e1e1e',
    padding: 24,
    paddingTop: 8,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    minHeight: 300,
    maxHeight: 700,
  },

  handle: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C4C7C5',
    alignSelf: 'center',
    marginBottom: 16,
  },

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },

  // KPI ROW
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },

  kpiCard: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: 'rgb(73, 69, 79)',
    borderRadius: 16,
    padding: 16,

    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  kpiLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },

  kpiValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },

  // CHART CARD
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 12,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
    marginBottom: 20,
  },

  // FUNNEL
  funnelContainer: {
    gap: 16,
  },

  funnelItem: {
    width: '100%',
  },

  funnelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  funnelLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  funnelValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  funnelBarBackground: {
    width: '100%',
    height: 18,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
  },

  funnelBarFill: {
    height: '100%',
    borderRadius: 999,
  },

  // DONUT LEGEND
  legendContainer: {
    marginTop: 12,
    gap: 10,

    position: 'absolute',
    right: 0,
  },

  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginRight: 8,
  },

  legendText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },

  // INSIGHTS OVER TIME
  insightsChartCard: {
    backgroundColor: '#333',
    borderRadius: 16,
    padding: 3,
    paddingTop: 16,
    marginTop: 16,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
    overflow: 'hidden',
  },

  insightsSectionTitle: {
    paddingLeft: 4,
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});