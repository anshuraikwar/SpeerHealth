import React, { useEffect, useMemo, useRef, useState } from 'react';

import { styles } from './styles';
import { priorityColors } from '../../styles/styles';

import { InsightType } from '../../type/InsightType';
import { ActivityResponseType } from '../../type/ActivityType';

import { getRelativeTime } from '../../utils/time-utils';

import { useQuery } from '@apollo/client/react';
import { LIST_INSIGHT_ACTIVITY } from '../../graphql/queries/listInsightActivity';

import {
  Pressable,
  View,
  Modal,
  FlatList,
} from 'react-native';
import {
  Text,
  Portal,
  Surface,
  Button,
  Divider,
  Chip,
  useTheme,
} from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';


export default function InsightDetailSheet({
  visible,
  setVisible,
  insight,
  insightUpdates,
  onEdit,
  onMoveStage,
}: {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  insight: InsightType;
  insightUpdates: Record<string, Partial<InsightType>>;
  onEdit: () => void;
  onMoveStage: () => void;
}) {
  const theme = useTheme();

  const priority =
    priorityColors[insight?.priority] ??
    priorityColors.P4;

  const { data, loading: loadingActivity, error: activityError } = useQuery<ActivityResponseType>(LIST_INSIGHT_ACTIVITY, {
    variables: {
      filter: {
        insightId: {
          eq: insight?.id,
        },
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  const activities = data?.insightActivitiesCollection?.edges.map(item => item.node) ?? [];

  const accumulatedUpdates = useMemo(() => {
    const updated = Object.values(insightUpdates).reduce((acc, curr) => {
      return {
        ...acc,
        ...curr
      }
    }, {});
    return updated;
  }, [insightUpdates]);

  if (!insight) return <></>;

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

              <Text variant="titleLarge" style={{ marginBottom: 4, color: 'title' in accumulatedUpdates ? 'yellow' : '#fff' }}>
                {insight.title}
              </Text>
              {insight.description && (
                <Text variant="bodyMedium" style={{ color: 'description' in accumulatedUpdates ? 'yellow' : theme.colors.onSurfaceVariant }}>
                  {insight.description}
                </Text>
              )}

              <Divider style={{ marginVertical: 12, }} />

              <ScrollView
                contentContainerStyle={{
                  paddingBottom: 32,
                }}
                showsVerticalScrollIndicator={false}
              >

                {/* HCP */}
                {insight.hcp && (
                  <View style={{ gap: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text variant="titleMedium" style={{ marginBottom: 4, color: 'hcp' in accumulatedUpdates ? 'yellow' : '#fff' }}>
                      HCP Details
                    </Text>

                    <View style={{ flexDirection: 'column' }}>
                      <Text style={{ textAlign: 'right', color: 'hcp' in accumulatedUpdates ? 'yellow' : '#fff' }}>
                        {insight.hcp?.name}
                      </Text>
                      <Text style={{ textAlign: 'right', color: 'hcp' in accumulatedUpdates ? 'yellow' : theme.colors.onSurfaceVariant }}>
                        {insight.hcp?.specialty}
                      </Text>
                      <Text style={{ textAlign: 'right', color: 'hcp' in accumulatedUpdates ? 'yellow' : theme.colors.onSurfaceVariant }}>
                        {insight.hcp?.institution}
                      </Text>
                    </View>
                  </View>
                )}

                {/* DRUG NAME */}
                {insight.drugName && (
                  <View style={{ marginTop: 12, gap: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text variant="titleMedium" style={{ marginBottom: 4, color: 'drugName' in accumulatedUpdates ? 'yellow' : '#fff' }}>
                      Drug Name
                    </Text>

                    <Text style={{ color: 'drugName' in accumulatedUpdates ? 'yellow' : '#fff' }}>{insight.drugName}</Text>
                  </View>
                )}

                <Divider style={{ marginVertical: 8 }} />

                {/* PRIORITY */}
                <View style={{ gap: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="titleMedium" style={{ marginBottom: 4, color: 'priority' in accumulatedUpdates || true ? 'yellow' : '#fff' }}>
                    Priority
                  </Text>

                  <View style={{ flexDirection: 'column' }}>
                    <Chip
                      compact
                      style={{
                        backgroundColor: priority.container,
                        borderRadius: 999,
                      }}
                      textStyle={{
                        color: 'priority' in accumulatedUpdates ? 'yellow' : priority.text,
                        fontWeight: '700',
                        marginVertical: 2,
                      }}
                    >
                      {insight.priority}
                    </Chip>
                  </View>
                </View>

                {/* STAGE */}
                <View style={{ marginTop: 8, gap: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="titleMedium" style={{ marginBottom: 4, color: 'stage' in accumulatedUpdates ? 'yellow' : '#fff' }}>
                    Stage
                  </Text>

                  <View style={{ flexDirection: 'column' }}>
                    <Chip
                      compact
                      style={{
                        height: 24,
                        backgroundColor: '#607D8B',
                        borderRadius: 999,
                      }}
                      textStyle={{
                        color: 'stage' in accumulatedUpdates ? 'yellow' : '#FFFFFF',
                        marginVertical: 2,
                        fontSize: 11,
                        fontWeight: '700',
                      }}
                    >
                      {insight.stage}
                    </Chip>
                  </View>
                </View>

                {/* CATEGORY */}
                {insight.category && (
                  <View style={{ marginTop: 8, gap: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text variant="titleMedium" style={{ marginBottom: 4, color: 'category' in accumulatedUpdates ? 'yellow' : '#fff' }}>
                      Category
                    </Text>

                    <View style={{ flexDirection: 'column' }}>
                      <Chip
                        compact
                        style={{
                          height: 24,
                          backgroundColor: insight.category.color,
                          borderRadius: 999,
                        }}
                        textStyle={{
                          color: 'category' in accumulatedUpdates ? 'yellow' : '#FFFFFF',
                          marginVertical: 2,
                          fontSize: 11,
                          fontWeight: '700',
                        }}
                      >
                        {insight.category.name}
                      </Chip>
                    </View>
                  </View>
                )}

                <Divider style={{ marginVertical: 8 }} />

                {/* CREATED AT */}
                <View style={{ gap: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="titleMedium" style={{ marginBottom: 4, }}>
                    Created At
                  </Text>

                  <Text>{getRelativeTime(insight.createdAt)}</Text>
                </View>

                {/* UPDATED AT */}
                <View style={{ marginTop: 8, marginBottom: 4, gap: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="titleMedium" style={{ color: 'updatedAt' in accumulatedUpdates ? 'yellow' : '#fff' }}>
                    Updated At
                  </Text>

                  <Text style={{ color: 'updatedAt' in accumulatedUpdates ? 'yellow' : '#fff' }}>
                    {getRelativeTime(insight.updatedAt)}
                  </Text>
                </View>

                {/* TAGS */}
                {insight?.insightTagsCollection && insight?.insightTagsCollection?.edges?.length > 0 && (
                  <>
                    <Divider style={{ marginVertical: 8 }} />
                    <View style={{ marginTop: 8, gap: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text variant="titleMedium" style={{ marginBottom: 4, }}>
                        Tags
                      </Text>

                      <View style={{
                        width: '50%',
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 4,
                        justifyContent: 'flex-end',
                      }}>
                        {insight?.insightTagsCollection?.edges?.map(tag => tag.node.tag).map(tag => (
                          <Chip
                            key={tag.id}
                            compact
                            style={{
                              height: 24,
                              backgroundColor: '#455A64',
                              borderRadius: 999,
                            }}
                            textStyle={{
                              color: '#FFFFFF',
                              marginVertical: 2,
                              fontSize: 11,
                              fontWeight: '700',
                            }}
                          >
                            {tag.name}
                          </Chip>
                        ))}
                      </View>
                    </View>
                  </>
                )}

                <Divider style={{ marginVertical: 8 }} />

                {/* ACTIVITY TIMELINE */}
                <View style={{ marginBottom: 8, gap: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="titleMedium">
                    Activity Timeline
                  </Text>
                  <Text>{loadingActivity ? 'Loading' : activities.length === 0 ? 'No activity' : ''}</Text>
                </View>
                {activityError ? (
                  <View style={{
                    padding: 16,
                    borderWidth: 1,
                    borderColor: "#F44336",
                    borderRadius: 4,
                    backgroundColor: "rgba(244, 67, 54, 0.1)"
                  }}>
                    <Text>Encountered error while fetching activity list: {activityError?.message}</Text>
                  </View>
                ) : (
                  activities.map((activity, i) => {
                    const timelineWidth = 8;
                    const timelineGap = 8;
                    return (
                      <React.Fragment key={activity.id}>
                        <View style={{
                          height: i > 0 ? 32 : 12,
                          display: 'flex',
                          flexDirection: 'row',
                          gap: timelineGap,
                        }}>
                          <View style={{
                            width: timelineWidth,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}>
                            <View
                              style={{
                                flex: 1,
                                width: 1,
                                backgroundColor: "rgb(73,69,79)",
                              }}
                            />
                          </View>
                        </View>
                        <View style={{
                          display: 'flex',
                          flexDirection: 'row',
                          gap: timelineGap,
                        }}>
                          <View style={{
                            width: timelineWidth,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}>
                            <View
                              style={{
                                flex: 1,
                                width: 1,
                                backgroundColor: "rgb(73,69,79)",
                              }}
                            />
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 999,
                                backgroundColor: "rgb(73,69,79)",
                              }}
                            />
                            <View
                              style={{
                                flex: 1,
                                width: 1,
                                backgroundColor: "rgb(73,69,79)",
                              }}
                            />
                          </View>
                          <View style={{ flex: 1, flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                            <Text>{activity.action}</Text>

                            <View
                              style={{
                                width: 4,
                                height: 4,
                                borderRadius: 999,
                                backgroundColor: "rgb(73,69,79)",
                              }}
                            />
                            <Text>{activity.user.fullName}</Text>
                          </View>
                        </View>
                        <View style={{
                          display: 'flex',
                          flexDirection: 'row',
                          gap: timelineGap,
                        }}>
                          <View style={{
                            width: timelineWidth,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}>
                            <View
                              style={{
                                flex: 1,
                                width: 1,
                                backgroundColor: "rgb(73,69,79)",
                              }}
                            />
                          </View>
                          <View style={{
                            flex: 1,
                            flexDirection: 'column',
                            gap: 8,
                          }}>
                            <Text variant='bodySmall' style={{ color: 'gray' }}>{getRelativeTime(activity.createdAt)}</Text>
                            <View style={{ display: 'flex', flexDirection: 'column' }}>
                              <View style={styles.activityContainer}>
                                <View style={[styles.row, styles.headerRow]}>
                                  <Text style={styles.headerCell}>
                                    Field Name
                                  </Text>

                                  <Text style={styles.headerCell}>
                                    Old Value
                                  </Text>

                                  <Text style={styles.headerCell}>
                                    New Value
                                  </Text>
                                </View>
                                <View style={styles.row}>
                                  <Text style={styles.cell}>
                                    {activity.fieldName || "-"}
                                  </Text>

                                  <Text style={styles.cell}>
                                    {`"${activity.oldValue}"` || "-"}
                                  </Text>

                                  <Text style={styles.cell}>
                                    {`"${activity.newValue}"` || "-"}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        </View>
                      </React.Fragment>
                    )
                  })
                )}
              </ScrollView>

              {/* ACTIONS */}
              <View style={{ marginTop: 48, gap: 10, flexDirection: 'row' }}>
                <Button
                  mode="contained"
                  onPress={onEdit}
                  style={{ width: '50%' }}
                >
                  Edit
                </Button>

                <Button
                  mode="outlined"
                  onPress={onMoveStage}
                  style={{ width: '50%' }}
                >
                  Move Stage
                </Button>
              </View>
            </Surface>
          </Pressable>
        </Pressable>
      </Modal>
    </Portal>
  )
}
