import React from 'react';

import { priorityColors } from '../../styles/styles';

import { InsightNodeType, InsightType } from '../../type/InsightType';
import { CategoriesType } from '../../type/categoriesType';
import { HCPType } from '../../type/HCPType';
import { TagType } from '../../type/tagType';
import { ErrorLike } from '@apollo/client';

import stages from '../../constants/stages';

import { capitalize } from '../../utils/string-utils';

import {
  FlatList,
  Pressable,
  View,
  RefreshControl,
} from 'react-native';
import {
  Text,
  SegmentedButtons,
  Divider,
  ActivityIndicator,
  useTheme,
  Chip,
} from 'react-native-paper';
import InsightCard from './InsightCard';
import FilterBar from './filters';
import { ScrollView } from 'react-native-gesture-handler';

export default function InsightList({
  view,
  setView,

  selectedStage,
  setSelectedStage,
  segregatedInsights,

  search,
  setSearch,
  filters,
  setFilters,

  loading,
  error,

  onCardPress,
  onLongPress,
  higthlightedInsightId,
  updateStage,
  onRefresh,
}: {
  view: string;
  setView: React.Dispatch<React.SetStateAction<string>>;

  selectedStage: string;
  setSelectedStage: React.Dispatch<React.SetStateAction<string>>;
  segregatedInsights: Record<string, InsightNodeType[]>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  filters: {
    priorities?: string[] | undefined;
    category?: CategoriesType | undefined;
    stage?: string;
    hcp?: HCPType;
    tags?: TagType[];
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    priorities?: string[];
    category?: CategoriesType;
    stage?: string;
    hcp?: HCPType;
    tags?: TagType[];
  }>>
  loading: boolean;
  error: ErrorLike | undefined;
  onCardPress: (insight: InsightType) => void;
  onLongPress: (insight: InsightType) => void;
  higthlightedInsightId: string | null;
  updateStage: (insight: InsightType, nextStage: string) => Promise<void>;
  onRefresh: () => void;
}) {
  const theme = useTheme();

  return (
    view === 'list' ? (
      <View style={{ flex: 1, paddingHorizontal: 12, }}>
        {/* Tabs */}
        <View
          style={{
            paddingTop: 12,
            paddingBottom: 8,
          }}
        >
          <SegmentedButtons
            value={selectedStage}
            onValueChange={setSelectedStage}
            density="small"
            buttons={stages.map((stage) => ({
              value: stage,
              label: `(${segregatedInsights[stage].length ?? 0}) ${capitalize(stage)}`,
            }))}
          />
        </View>

        {/* FILTER BAR */}
        <FilterBar
          search={search}
          setSearch={setSearch}
          onClear={() => {
            setSearch('');
            setFilters({});
          }}
          filters={filters}
          setFilters={setFilters}
        />

        {loading && (
          <ActivityIndicator />
        )}
        {error && (
          <View style={{
            padding: 16,
            borderWidth: 1,
            borderColor: "#F44336",
            borderRadius: 4,
            backgroundColor: "rgba(244, 67, 54, 0.1)"
          }}>
            <Text>Encountered error while fetching insight list: {error?.message}</Text>
          </View>
        )}

        {/* INSIGHT CARDS LIST */}
        <FlatList
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: 24
          }}
          data={segregatedInsights[selectedStage]}
          keyExtractor={(item) => item.node.nodeId}
          renderItem={({ item }) => {
            const insight = item.node;

            return (
              <>
                <Pressable
                  onPress={() => {
                    onCardPress(insight);
                  }}
                  onLongPress={() => {
                    onLongPress(insight);
                  }}
                  style={{
                    borderWidth: 1,
                    borderColor: higthlightedInsightId === insight.id ? 'yellow' : 'transparent',
                  }}
                >
                  <InsightCard insight={insight} updateStage={updateStage} />
                </Pressable>
                <Divider />
              </>
            );
          }}
          ListEmptyComponent={
            <View style={{
              flex: 1,
              padding: 8,
              justifyContent: 'center',
            }}>
              <Text style={{ textAlign: 'center' }}>{loading ? 'Loading...' : 'No insights'}</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
            />
          }
        />
      </View>
    ) : (
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {stages.map((stage) => {
            const insights = segregatedInsights[stage];

            return (
              <View key={stage} style={{
                minHeight: 100,
                // flex: 1,
                borderBottomWidth: 0.5,
                borderLeftWidth: 0.5,
                borderColor: 'rgb(73, 69, 79)',
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
                <Pressable
                  style={{
                    minHeight: 167,
                    borderRightWidth: 0.5,
                    borderBottomWidth: 0.5,
                    borderColor: 'rgb(73, 69, 79)',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    setSelectedStage(stage);
                    setView('list');
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                      fontSize: 12,
                      lineHeight: 14,
                    }}
                    variant='bodySmall'
                  >
                    {stage.toUpperCase().split('').join('\n')}
                  </Text>
                </Pressable>
                <View style={{
                  flex: 1,
                  flexDirection: 'row',
                  padding: 8,
                }}>
                  <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    {insights.slice(0, 3).map((insight) => {
                      const priority =
                        priorityColors[insight.node?.priority] ??
                        priorityColors.P4;

                      return (
                        <View key={insight.node.id} style={{
                          maxWidth: 150,
                          borderRadius: 4,
                          marginRight: 8,
                          padding: 12,

                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',

                          backgroundColor: 'rgb(21, 21, 22)',
                        }}>
                          <View style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: 4,
                          }}>
                            <Text numberOfLines={2} ellipsizeMode="tail">{insight.node.title}</Text>
                            {insight.node.description && (
                              <Text variant="bodySmall" numberOfLines={2} ellipsizeMode="tail" style={{ color: theme.colors.onSurfaceVariant }}>{insight.node.description}</Text>
                            )}
                          </View>
                          <View style={{ flex: 0 }}>
                            <Chip
                              compact
                              style={{
                                backgroundColor: priority.container,
                                borderRadius: 999,

                                display: 'flex',
                                alignItems: 'center'
                              }}
                              textStyle={{
                                color: priority.text,
                                fontWeight: '700',
                                marginVertical: 2,
                                textAlign: 'center'
                              }}
                            >
                              {insight.node.priority}
                            </Chip>
                          </View>
                        </View>
                      )
                    })}
                    {insights.length > 3 && (
                      <Pressable
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 4,
                          backgroundColor: 'rgb(21, 21, 22)',
                          justifyContent: 'center',
                        }}
                        onPress={() => {
                          setSelectedStage(stage);
                          setView('list');
                        }}
                      >
                        <Text
                          style={{
                            color: 'white',
                            textAlign: 'center',
                            fontSize: 12,
                            lineHeight: 14,
                          }}
                          variant='bodySmall'
                        >{`+${insights.length - 3} MORE`.split('').join('\n')}</Text>
                      </Pressable>
                    )}
                  </ScrollView>
                </View>
              </View>
            )
          })}
        </ScrollView>
      </View>
    )
  )
}
