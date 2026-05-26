import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { styles } from './styles';
import { Ionicons } from '@expo/vector-icons';

import { InsightNodeType, ListInsightResponseType, InsightType } from '../../type/InsightType';
import { Activity, ActivityResponseType, ActivitySubscriptionType } from '../../type/ActivityType';
import { CategoriesType } from '../../type/categoriesType';
import { HCPType } from '../../type/HCPType';
import { TagType } from '../../type/tagType';

import stages from '../../constants/stages';
import { INSIGHT_ACTIVITY_ACTIONS } from '../../constants/activityAction';

import { supabase } from '../../lib/supabase';

import { capitalize } from '../../utils/string-utils';
import { getChangedFields } from '../../utils/insight-diff';

import { useDebounce } from '../../hooks/useDebounce';

import { LIST_INSIGHTS } from '../../graphql/queries/listInsights';
import { UPDATE_INSIGHT } from '../../graphql/mutations/updateInsight';
import { CREATE_INSIGHT_ACTIVITY } from '../../graphql/mutations/createInsigntActivity';
import { LIST_INSIGHT_ACTIVITY } from '../../graphql/queries/listInsightActivity';

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
} from 'react-native-paper';
import InsightCard from './InsightCard';
import FilterBar from './filters';
import InsightDetailSheet from '../insight-detail-sheet';
import CreateInsightForm from '../create-insight';
import AnalyticsBottomSheet from '../analytics';
import StageSelector from '../stage-selector';
import Toast from 'react-native-toast-message';
import BoardActivity from '../board-activity';

export default function InsightsList() {
  const insets = useSafeAreaInsets();
  const client = useApolloClient();

  const [selectedStage, setSelectedStage] = useState(stages[0]);
  const selectedStageRef = useRef(selectedStage);
  useEffect(() => {
    selectedStageRef.current = selectedStage;
  }, [selectedStage]);

  const [selectedInsight, setSelectedInsight] = useState<InsightType | null>(null);
  const selectedInsightRef = useRef<InsightType>(null);
  useEffect(() => {
    selectedInsightRef.current = selectedInsight;
  }, [selectedInsight]);
  const [selectedInsightUpdates, setSelectedInsightUpdates] = useState<Record<string, Partial<InsightType>>>({});
  const [detailSheetVisible, setDetailSheetVisible] = useState(false);
  useEffect(() => {
    if (!detailSheetVisible) {
      setSelectedInsight(null);
    }
  }, [detailSheetVisible]);

  const [editInsightFlow, setEditInsightFlow] = useState(false);
  const [createInsightFormVisible, setCreateInsightFormVisible] = useState(false);
  const [insightToEdit, setInsightToEdit] = useState<InsightType | null>(null);
  useEffect(() => {
    if (!createInsightFormVisible) {
      setInsightToEdit(null);
      setEditInsightFlow(false);
    }
  }, [createInsightFormVisible]);

  const [stageSelectorVisible, setStageSelectorVisible] = useState(false);
  useEffect(() => {
    if (!stageSelectorVisible) {
      setInsightToEdit(null);
    }
  }, [stageSelectorVisible]);

  const [analyticsSheetVisible, setAnalyticsSheetVisible] = useState(false);

  const [boardActivitySheetVisible, setBoardActivitySheetVisible] = useState(false);
  const boardActivitySheetVisibleRef = useRef<boolean>(null);
  useEffect(() => {
    boardActivitySheetVisibleRef.current = boardActivitySheetVisible;
  }, [boardActivitySheetVisible]);
  const [unreadActivityCount, setUnreadActivityCount] = useState<number>(0);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<{
    priorities?: string[];
    category?: CategoriesType;
    stage?: string;
    hcp?: HCPType;
    tags?: TagType[];
  }>({});
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

    if (filters?.priorities && filters?.priorities?.length > 0) {
      conditions.push({
        priority: {
          in: filters.priorities,
        },
      });
    }

    if (filters?.category) {
      conditions.push({
        categoryId: {
          eq: filters.category.id,
        },
      });
    }

    if (filters?.stage) {
      conditions.push({
        stage: {
          eq: filters.stage,
        },
      });
    }
    if (filters?.hcp) {
      conditions.push({
        hcpId: {
          eq: filters.hcp.id,
        },
      });
    }

    return conditions.length > 0 ? { and: conditions } : {};
  }, [debouncedSearch, filters]);

  const {
    data,
    loading,
    error,
    refetch: refetchInsightsList
  } = useQuery<ListInsightResponseType>(LIST_INSIGHTS, {
    variables: {
      filter,
    },
    fetchPolicy: 'cache-and-network',
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
  }, [insights]);

  const flatListRef = useRef<FlatList>(null);
  const [higthlightedInsightId, setHigthlightedInsightId] = useState<string | null>(null);
  const scrollToHigthlightedInsight = () => {
    if (higthlightedInsightId) {
      const index = segregatedInsights[selectedStage].findIndex((item) => item.node.id === higthlightedInsightId);

      if (index !== -1) {
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5, // center item
        });
      }
    }
  };

  const [createInsightActivity] = useMutation(
    CREATE_INSIGHT_ACTIVITY
  );

  const [updateInsight] = useMutation(
    UPDATE_INSIGHT
  );
  const updateStage = async (
    insight: InsightType,
    nextStage: string,
  ) => {
    try {
      await updateInsight({
        variables: {
          filter: {
            id: {
              eq: insight.id,
            },
          },
          set: {
            stage: nextStage,
          },
        },

        optimisticResponse: {
          updateInsightsCollection: {
            __typename: 'InsightsUpdateResponse',
            affectedCount: 1,
            records: [
              {
                __typename: 'Insights',
                ...insight,
                stage: nextStage,
              },
            ],
          },
        },
      });

      const currentUserId = await supabase.auth
        .getSession()
        .then(({ data }) => {
          return data.session?.user?.id;
        })
        .catch((error) => {
        });

      await createInsightActivity({
        variables: {
          input: [
            {
              insightId: insight.id,
              userId: currentUserId,

              action: INSIGHT_ACTIVITY_ACTIONS.MOVE,

              fieldName: 'stage',
              oldValue: insight.stage,
              newValue: nextStage,
            },
          ],
        },
      });
      Toast.show({
        type: 'success',
        text1: 'Insight moved',
        text2: `Your insight was moved to ${nextStage}`,
        position: 'bottom',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: JSON.stringify(error, null, 2),
        position: 'bottom',
      });
    }
  };

  const getInsight = async (insightId: string) => {
    try {
      const { data } = await client.query<ListInsightResponseType>({
        query: LIST_INSIGHTS,
        variables: {
          first: 1,
          filter: {
            id: {
              eq: insightId,
            },
          },
        },
        fetchPolicy: 'network-only',
      });

      const insight = data?.insightsCollection?.edges?.[0]?.node;
      return insight;
    } catch (error) {
      console.error(
        `Encountered error while fetching insight "${insightId}" : \n`, JSON.stringify(error, null, 2),
      )
    }
  }
  const updateListInsightCache = async ({
    insight,
    insightId,
    newStage,
  }: {
    insight?: InsightType,
    insightId?: string;
    newStage?: string;
  }) => {
    const completeInsight = selectedInsightRef.current && selectedInsightRef.current?.id === insightId && newStage
      ? { ...selectedInsightRef.current, stage: newStage }
      : insight
        ? insight
        : insightId
          ? await getInsight(insightId)
          : null;
    if (!completeInsight) return;

    client.cache.updateQuery<ListInsightResponseType>(
      {
        query: LIST_INSIGHTS,
        variables: {
          filter: {},
          first: 20,
        },
      },
      (existingData) => {
        if (!existingData) return existingData;

        const alreadyExists =
          existingData.insightsCollection.edges.some(
            (edge) => edge.node.id === completeInsight.id
          );
        if (alreadyExists) {
          return {
            ...existingData,
            insightsCollection: {
              ...existingData.insightsCollection,

              edges:
                existingData.insightsCollection.edges.map(
                  (edge) => {
                    // update matching insight
                    if (edge.node.id === completeInsight.id) {
                      const updatedNode: InsightType = { ...edge.node, ...completeInsight };
                      return {
                        ...edge,
                        node: updatedNode,
                      };
                    }

                    return edge;
                  }
                ),
            },
          };
        }

        return {
          ...existingData,
          insightsCollection: {
            ...existingData.insightsCollection,
            edges: [
              {
                node: completeInsight,
              },

              ...existingData.insightsCollection.edges,
            ],
          },
        };
      }
    );
  }
  const updateSelectedInsight = async ({
    insight,
    insightId,
    newStage,
    activityId,
  }: {
    insight?: InsightType,
    insightId?: string,
    newStage?: string,
    activityId: string,
  }) => {
    const updatedInsight = newStage ? { ...selectedInsightRef.current, stage: newStage } : insight ? insight : insightId ? await getInsight(insightId) : null;

    if (!selectedInsightRef.current) return;
    if (!updatedInsight) return;

    const diff = getChangedFields(
      selectedInsightRef.current,
      updatedInsight,
      {
        ignoreFields: [
          '__typename' as keyof InsightType,
          'nodeId',
          'columnOrder',
        ],
      }
    );
    if (diff.length === 0) return;

    function setField<K extends keyof InsightType>(
      obj: Partial<InsightType>,
      key: K,
      value: InsightType[K]
    ) {
      obj[key] = value;
    }
    const updates = diff.reduce<Partial<InsightType>>((acc, curr) => {
      if (curr && curr.newValue) { setField(acc, curr.field, curr.newValue); }
      return acc;
    }, {});
    setSelectedInsightUpdates(prev => ({
      ...prev,
      [activityId]: updates,
    }));

    const timer = setTimeout(() => {
      setSelectedInsightUpdates(prev => {
        const cloned = { ...prev };
        delete cloned[activityId];
        return cloned;
      });
      clearTimeout(timer);
    }, 1000);
    setSelectedInsight(updatedInsight as InsightType);
  }

  const getActivity = async (activityId: string) => {
    try {
      const { data } = await client.query<ActivityResponseType>({
        query: LIST_INSIGHT_ACTIVITY,
        variables: {
          first: 1,
          filter: {
            id: {
              eq: activityId,
            },
          },
        },
        fetchPolicy: 'network-only',
      });
      const activity = data?.insightActivitiesCollection?.edges?.[0]?.node;
      return activity;
    } catch (error) {
      console.error(
        `Encountered error while fetching activity "${activityId}" : \n`, JSON.stringify(error, null, 2),
      )
    }
  }
  const addActivityToSelectedInsightActivityLog = async ({
    activity,
    activityId,
    insightId
  }: {
    activity?: Activity,
    activityId?: string,
    insightId: string;
  }) => {
    const completeActivity = activity ? activity : activityId ? await getActivity(activityId) : null;
    if (!completeActivity) return;

    client.cache.updateQuery<ActivityResponseType>(
      {
        query: LIST_INSIGHT_ACTIVITY,
        variables: {
          filter: {
            insightId: {
              eq: insightId,
            },
          },
          first: 5,
        },
      },
      (existingData) => {
        if (!existingData) return existingData;

        // prevent duplicates
        const alreadyExists =
          existingData.insightActivitiesCollection.edges.some(
            (edge) => edge.node.id === completeActivity.id
          );

        if (alreadyExists) {
          return existingData;
        }

        return {
          ...existingData,
          insightActivitiesCollection: {
            ...existingData.insightActivitiesCollection,
            edges: [
              {
                node: completeActivity,
              },

              // prepend existing items
              ...existingData.insightActivitiesCollection.edges,
            ].slice(0, 5), // maintain page size
          },
        };
      }
    );
  }
  const addActivityToBoardActivityLog = async ({
    activity,
    activityId,
  }: {
    activity?: Activity,
    activityId?: string,
  }) => {
    const completeActivity = activity ? activity : activityId ? await getActivity(activityId) : null;
    if (!completeActivity) return;

    client.cache.updateQuery<ActivityResponseType>(
      {
        query: LIST_INSIGHT_ACTIVITY,
        variables: {
          filter: {},
          first: 20,
        },
      },
      (existingData) => {
        if (!existingData) return existingData;

        // prevent duplicates
        const alreadyExists =
          existingData.insightActivitiesCollection.edges.some(
            (edge) => edge.node.id === completeActivity.id
          );

        if (alreadyExists) {
          return existingData;
        }

        return {
          ...existingData,
          insightActivitiesCollection: {
            ...existingData.insightActivitiesCollection,
            edges: [
              {
                node: completeActivity,
              },

              // prepend existing items
              ...existingData.insightActivitiesCollection.edges,
            ].slice(0, 5), // maintain page size
          },
        };
      }
    );
  }

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupSubscription = async () => {
      const currentUserId = await supabase.auth
        .getSession()
        .then(({ data }) => {
          return data.session?.user?.id;
        })
        .catch((error) => {
          console.error(error);
          return undefined;
        });

      if (!currentUserId) {
        return;
      }

      channel = supabase
        .channel('insight-activity-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'insight_activities',

            filter: `user_id=neq.${currentUserId}`,
          },
          async (payload) => {
            try {
              const activity = payload.new as ActivitySubscriptionType;
              const activityId = activity.id;
              const insightId = activity.insight_id;

              setUnreadActivityCount(prev => prev + 1);
              if (activity.action === INSIGHT_ACTIVITY_ACTIONS.MOVE) {
                const completeActivity = await getActivity(activityId);

                if (completeActivity && selectedStageRef.current === completeActivity.oldValue) {
                  Toast.show({
                    type: 'info',
                    text1: `${completeActivity.user.fullName} moved "${completeActivity.insight.title}" to ${completeActivity.newValue}`,
                    position: 'bottom',
                  });
                }

                if (insightId === selectedInsightRef.current?.id) {
                  if (activity && activity.new_value) {
                    updateSelectedInsight({ newStage: activity.new_value, insightId, activityId });
                    updateListInsightCache({ newStage: activity.new_value, insightId });
                  }
                  addActivityToSelectedInsightActivityLog({ activity: completeActivity, insightId });
                } else {
                  updateListInsightCache({ insightId });
                }
                if (boardActivitySheetVisibleRef.current) {
                  addActivityToBoardActivityLog({ activity: completeActivity });
                }
              } else if (activity.action === INSIGHT_ACTIVITY_ACTIONS.CREATE) {
                updateListInsightCache({ insightId });

                const completeActivity = await getActivity(activityId);
                if (completeActivity) {
                  Toast.show({
                    type: 'info',
                    text1: `${completeActivity.user.fullName} created "${completeActivity.insight.title}"`,
                    position: 'bottom',
                  });
                }
                if (boardActivitySheetVisibleRef.current) {
                  addActivityToBoardActivityLog({ activity: completeActivity, activityId });
                }
              } else if (activity.action === INSIGHT_ACTIVITY_ACTIONS.EDIT) {
                const insight = await getInsight(insightId);
                if (insight) updateListInsightCache({ insight, insightId });

                if (insightId === selectedInsightRef.current?.id) {
                  if (insight) updateSelectedInsight({ insight, insightId, activityId });
                  addActivityToSelectedInsightActivityLog({ activityId, insightId });
                }
                if (boardActivitySheetVisibleRef.current) {
                  addActivityToBoardActivityLog({ activityId });
                }
              }
            } catch (error) {
              console.error(error);
            }
          }
        )
        .subscribe();
    }
    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return (
    <View style={{ flex: 1, }}>
      {/* MAIN CONTENT */}
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
                    setSelectedInsight(insight);
                    setDetailSheetVisible(true);
                  }}
                  onLongPress={() => {
                    setInsightToEdit(insight);
                    setStageSelectorVisible(true);
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
              onRefresh={() => { refetchInsightsList() }}
            />
          }
        />
      </View>
      {/* BOTTOM TABS */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 4 }]}>
        <View style={styles.tab}>
          <Pressable
            style={styles.tabContent}
            onPress={() => {
              setBoardActivitySheetVisible(true);
              setUnreadActivityCount(0);
            }}>
            {(unreadActivityCount > 0) && (
              <View style={styles.unreadNotificationsBadge}>
                <Text variant='bodySmall' style={{ textAlign: 'center' }}>{unreadActivityCount}</Text>
              </View>
            )}
            <Ionicons name="notifications-outline" size={32} color="white" />
            <Text variant='bodySmall' style={{ textAlign: 'center' }}>Notifications</Text>
          </Pressable>
        </View>
        <View style={styles.tab}>
          <Pressable
            style={styles.tabContent}
            onPress={() => {
              setAnalyticsSheetVisible(true);
            }}
          >
            <Ionicons name="bar-chart" size={32} color="white" />
            <Text variant='bodySmall' style={{ textAlign: 'center' }}>Analytics</Text>
          </Pressable>
        </View>
        <View style={styles.tab}>
          <Pressable
            style={styles.tabContent}
            onPress={() => {
              setCreateInsightFormVisible(true);
            }}
          >
            <Ionicons name="add" size={32} color="white" />
            <Text variant='bodySmall' style={{ textAlign: 'center' }}>Create</Text>
          </Pressable>
        </View>
      </View>

      {/* CREATE INSIGHT */}
      {(createInsightFormVisible) && (
        <CreateInsightForm
          visible={createInsightFormVisible}
          setVisible={setCreateInsightFormVisible}
          editFlow={editInsightFlow}
          insight={insightToEdit}
          triggerRefetch={debouncedSearch.trim().length > 0 || Object.keys(filters).length > 0}
          refetch={() => { refetchInsightsList() }}
        />
      )}

      {/* ANALYTICS */}
      {analyticsSheetVisible && (
        <AnalyticsBottomSheet
          visible={analyticsSheetVisible}
          setVisible={setAnalyticsSheetVisible}
          totalInsights={insights.length}
          insights={insights}
          segregatedInsights={segregatedInsights}
        />
      )}

      {/* INSIGHT DETAIL SHEET */}
      {(detailSheetVisible && selectedInsight) && (
        <InsightDetailSheet
          visible={detailSheetVisible}
          setVisible={setDetailSheetVisible}
          insight={selectedInsight}
          insightUpdates={selectedInsightUpdates}
          onEdit={() => {
            setInsightToEdit(selectedInsight);
            setDetailSheetVisible(false);
            setEditInsightFlow(true);
            setCreateInsightFormVisible(true);
          }}
          onMoveStage={() => {
            setInsightToEdit(selectedInsight);
            setDetailSheetVisible(false);
            setEditInsightFlow(true);
            setStageSelectorVisible(true);
          }}
        />
      )}

      {/* STAGE SELECTOR SHEET */}
      {(stageSelectorVisible && insightToEdit) && (
        <StageSelector
          visible={stageSelectorVisible}
          setVisible={setStageSelectorVisible}
          insight={insightToEdit}
          updateStage={updateStage}
        />
      )}

      {/* BOARD ACTIVITY SHEET */}
      {boardActivitySheetVisible && (
        <BoardActivity
          visible={boardActivitySheetVisible}
          setVisible={setBoardActivitySheetVisible}
          onPress={(insightId: string, insightStage: string) => {
            setBoardActivitySheetVisible(false);
            if (insightStage) setSelectedStage(insightStage);
            scrollToHigthlightedInsight();
            if (insightId) {
              setHigthlightedInsightId(insightId);
              const timer = setTimeout(() => {
                setHigthlightedInsightId(null);
                clearTimeout(timer);
              }, 1000)
            }
          }}
        />
      )}
    </View>
  )
}
