import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';

import { InsightNodeType, InsightResponseType } from '../../type/InsightType';

import { Ionicons } from '@expo/vector-icons';

import stages from '../../constants/stages';

import { capitalize } from '../../utils/string-utils';

import { useDebounce } from '../../hooks/useDebounce';

import { LIST_INSIGHTS } from '../../graphql/queries/listInsights';

import {
  FlatList,
  Pressable,
  View,
} from 'react-native';
import {
  Text,
  SegmentedButtons,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import InsightCard from './InsightCard';
import FilterBar from './FilterBar';
import InsightDetailSheet from '../InsightDetailSheet';
import CreateInsightForm from '../create-insight';
import AnalyticsBottomSheet from '../Analytics';

export default function InsightsList() {
  const [selectedStage, setSelectedStage] = React.useState(stages[0]);

  const [search, setSearch] = React.useState('');
  const [selectedPriorities, setSelectedPriorities] = React.useState<string[]>([]);

  const [selectedInsight, setSelectedInsight] =
    React.useState<any>(null);
  const [detailSheetVisible, setDetailSheetVisible] =
    React.useState(false);

  useEffect(() => {
    if (!detailSheetVisible) {
      setSelectedInsight(null);
    }
  }, [detailSheetVisible]);

  const [editInsightFlow, setEditInsightFlow] =
    React.useState(false);

  const [createInsightFormVisible, setCreateInsightFormVisible] = React.useState(false);
  const [insightToEdit, setInsightToEdit] =
    React.useState<any>(null);
  React.useState<any>(null);

  const [analyticsSheetVisible, setAnalyticsSheetVisible] =
    React.useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const filter = React.useMemo(() => {
    const conditions: any[] = [];

    if (debouncedSearch) {
      conditions.push({
        or: [
          { title: { ilike: `%${debouncedSearch}%` } },
          { description: { ilike: `%${debouncedSearch}%` } },
        ],
      });
    }

    if (selectedPriorities.length > 0) {
      conditions.push({
        priority: {
          in: selectedPriorities,
        },
      });
    }

    return conditions.length > 0 ? { and: conditions } : {};
  }, [debouncedSearch, selectedPriorities]);

  const { data, loading, error, refetch: refetchInsightsList } = useQuery<InsightResponseType>(LIST_INSIGHTS, {
    variables: {
      filter,
    },
    fetchPolicy: 'network-only',
  });
  const insights: InsightNodeType[] = data?.insightsCollection?.edges ?? [];
  const segregatedInsights: Record<string, InsightNodeType[]> = useMemo(() => {
    const segregated: Record<string, InsightNodeType[]> = {};
    stages.map(stage => { segregated[stage] = [] });
    insights.map((insight) => {
      if (Object.keys(segregated).includes(insight.node.stage)) {
        segregated[insight.node.stage].push(insight);
      }
    });
    return segregated;
  }, [insights])

  return (
    <View style={{ flex: 1 }}>
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
        selectedPriorities={selectedPriorities}
        setSelectedPriorities={setSelectedPriorities}
        onClear={() => {
          setSearch('');
          setSelectedPriorities([]);
        }}
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

      <FlatList
        style={{ flex: 1 }}
        data={segregatedInsights[selectedStage]}
        keyExtractor={(item) => item.node.nodeId}
        renderItem={({ item }) => {
          const insight = item.node;

          return (
            <>
              <Pressable
                onPress={() => {
                  setSelectedInsight(insight);
                  setDetailSheetVisible(true);
                }}
              >
                <InsightCard insight={insight} />
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
      />

      <Pressable
        onPress={() => {
          setCreateInsightFormVisible(true);
        }}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: '#3F51B5',
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 6, // Android shadow
          shadowColor: '#000', // iOS shadow
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        }}
      >
        <Ionicons name="add" size={32} color="white" />
      </Pressable>

      <CreateInsightForm
        visible={createInsightFormVisible}
        setVisible={setCreateInsightFormVisible}
        editFlow={editInsightFlow}
        insight={insightToEdit}
        onSuccess={() => { refetchInsightsList(); }}
      />

      {detailSheetVisible && (
        <InsightDetailSheet
          sheetVisible={detailSheetVisible}
          setSheetVisible={setDetailSheetVisible}
          insight={selectedInsight}
          onEdit={() => {
            setInsightToEdit(selectedInsight);
            setDetailSheetVisible(false);
            setEditInsightFlow(true);
            setCreateInsightFormVisible(true);
          }}
          onMoveStage={() => console.log('onMoveStage')}
        />
      )}


      <Pressable
        onPress={() => {
          setAnalyticsSheetVisible(true);
        }}
        style={{
          position: 'absolute',
          bottom: 24,
          left: 24,
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: '#3F51B5',
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 6, // Android shadow
          shadowColor: '#000', // iOS shadow
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        }}
      >
        <Ionicons name="bar-chart" size={32} color="white" />
      </Pressable>

      {analyticsSheetVisible && (
        <AnalyticsBottomSheet
          visible={analyticsSheetVisible}
          setVisible={setAnalyticsSheetVisible}
          totalInsights={insights.length}
          insights={insights}
          segregatedInsights={segregatedInsights}
        />
      )}
    </View>
  )
}
