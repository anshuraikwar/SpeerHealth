import React from 'react';

import { priorityColors } from '../styles/styles';
import { InsightType } from '../type/InsightType';
import { getRelativeTime } from '../utils/time-utils';
import {
  Pressable,
  View,
  StyleSheet,
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
import { useQuery } from '@apollo/client/react';
import { LIST_INSIGHT_ACTIVITY } from '../graphql/queries/listInsightActivity';
import { Activity, ActivityResponseType } from '../type/ActivityType';


export default function InsightDetailSheet({
  sheetVisible,
  setSheetVisible,
  insight,
  onEdit,
  onMoveStage,
}: {
  sheetVisible: boolean;
  setSheetVisible: React.Dispatch<React.SetStateAction<boolean>>;
  insight: InsightType;
  onEdit: () => void;
  onMoveStage: () => void;
}) {
  const theme = useTheme();

  const priority =
    priorityColors[insight?.priority] ??
    priorityColors.P4;

  const { data, loading: loadingActivity } = useQuery<ActivityResponseType>(LIST_INSIGHT_ACTIVITY, {
    variables: {
      insightId: insight?.id,
    },
    fetchPolicy: 'cache-and-network',
  });
  const activities = data?.insightActivitiesCollection?.edges.map(item => item.node) ?? [];
  const renderRow = ({ item }: { item: Activity }) => (
    <>
      <View style={styles.row}>
        <Text style={[styles.cell, styles.action]}>
          {item.action}
        </Text>

        <Text style={styles.cell}>
          {item.fieldName || "-"}
        </Text>

        <Text style={styles.cell}>
          {`"${item.oldValue}"` || "-"}
        </Text>

        <Text style={styles.cell}>
          {`"${item.newValue}"` || "-"}
        </Text>

        <Text style={styles.cell}>
          {getRelativeTime(item.createdAt)}
        </Text>
      </View>
      <Divider />
    </>
  );

  if (!insight) return <></>;

  return (
    <Portal>
      <Modal
        visible={sheetVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => {
          setSheetVisible(false);
        }}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setSheetVisible(false)}
        >
          <Pressable style={styles.sheetWrapper}>
            <Surface id="sheet" style={styles.sheet} elevation={1}>
              <View id="handle" style={styles.handle} />

              {/* TITLE */}
              <Text variant="titleLarge" style={{ marginBottom: 4, }}>
                {insight.title}
              </Text>

              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {insight.description}
              </Text>

              <Divider style={{ marginVertical: 12, }} />

              {/* HCP */}
              <View style={{ gap: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="titleMedium" style={{ marginBottom: 4, }}>
                  HCP Details
                </Text>

                <View style={{ flexDirection: 'column' }}>
                  <Text style={{ textAlign: 'right' }}>
                    {insight.hcp?.name}
                  </Text>
                  <Text style={{ textAlign: 'right', color: theme.colors.onSurfaceVariant }}>
                    {insight.hcp?.specialty}
                  </Text>
                  <Text style={{ textAlign: 'right', color: theme.colors.onSurfaceVariant }}>
                    {insight.hcp?.institution}
                  </Text>
                </View>
              </View>

              {/* DRUG NAME */}
              {insight.drugName && (
                <View style={{ marginTop: 12, gap: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="titleMedium" style={{ marginBottom: 4, }}>
                    Drug Name
                  </Text>

                  <Text>{insight.drugName}</Text>
                </View>
              )}

              <Divider style={{ marginVertical: 8 }} />

              {/* PRIORITY */}
              {insight.priority && (
                <View style={{ gap: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="titleMedium" style={{ marginBottom: 4, }}>
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
                        color: priority.text,
                        fontWeight: '700',
                        marginVertical: 2,
                      }}
                    >
                      {insight.priority}
                    </Chip>
                  </View>
                </View>
              )}

              {/* STAGE */}
              {insight.stage && (
                <View style={{ marginTop: 8, gap: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="titleMedium" style={{ marginBottom: 4, }}>
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
                        color: '#FFFFFF',
                        marginVertical: 2,
                        fontSize: 11,
                        fontWeight: '700',
                      }}
                    >
                      {insight.stage}
                    </Chip>
                  </View>
                </View>
              )}

              {/* CATEGORY */}
              {insight.category && (
                <View style={{ marginTop: 8, gap: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="titleMedium" style={{ marginBottom: 4, }}>
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
                        color: '#FFFFFF',
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
              {insight.createdAt && (
                <View style={{ gap: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="titleMedium" style={{ marginBottom: 4, }}>
                    Created At
                  </Text>

                  <Text>{getRelativeTime(insight.createdAt)}</Text>
                </View>
              )}

              {/* UPDATED AT */}
              {insight.updatedAt && (
                <View style={{ gap: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="titleMedium" style={{ marginBottom: 4, }}>
                    Updated At
                  </Text>

                  <Text>{getRelativeTime(insight.updatedAt)}</Text>
                </View>
              )}

              {/* TAGS */}
              {insight?.insightTagsCollection?.edges?.length > 0 && (
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

              {/* TIMELINE (mocked for now) */}
              <Text variant="titleMedium">
                Activity Timeline
              </Text>
              <View style={styles.activityContainer}>
                <View style={[styles.row, styles.headerRow]}>
                  <Text style={[styles.headerCell, styles.action]}>
                    Action
                  </Text>

                  <Text style={styles.headerCell}>
                    Field
                  </Text>

                  <Text style={styles.headerCell}>
                    Old Value
                  </Text>

                  <Text style={styles.headerCell}>
                    New Value
                  </Text>

                  <Text style={styles.headerCell}>
                    Time
                  </Text>
                </View>
                <FlatList
                  data={activities}
                  keyExtractor={(item) => item.id}
                  renderItem={renderRow}
                  ListEmptyComponent={
                    <View style={{
                      flex: 1,
                      paddingVertical: 12,
                      justifyContent: 'center',
                    }}>
                      <Text style={{ textAlign: 'center' }}>{loadingActivity ? 'Loading...' : 'No activity'}</Text>
                    </View>
                  }
                />
              </View>

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
  },

  handle: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C4C7C5',
    alignSelf: 'center',
    marginBottom: 16,
  },

  activityContainer: {
    marginTop: 8,
    borderWidth: 0.5,
    borderColor: "rgb(73,69,79)",
    borderRadius: 8,
    overflow: "hidden",
  },

  headerRow: {
    backgroundColor: "rgba(0,0,0,0.2)",
  },

  row: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },

  headerCell: {
    flex: 1,
    fontWeight: "700",
    fontSize: 12,
    textAlign: "center",
  },

  cell: {
    flex: 1,
    fontSize: 12,
    textAlign: "center",
  },

  action: {
    flex: 0.8,
  },
});
