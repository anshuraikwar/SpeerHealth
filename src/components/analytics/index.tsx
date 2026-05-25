import React from 'react';

import { LineChart, PieChart } from 'react-native-chart-kit';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

import { InsightNodeType } from '../../type/InsightType';

import {
  Pressable,
  View,
  Modal,
  Dimensions,
} from 'react-native';
import {
  Text,
  Portal,
  Surface,
  Divider,
} from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import { styles } from './styles';

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
                    width={screenWidth * 0.8}
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

