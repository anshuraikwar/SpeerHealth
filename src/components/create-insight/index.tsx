import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { NetworkStatus } from '@apollo/client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { styles } from './styles';

import { CreateInsightTagsResponseType, TagResponseType } from '../../type/tagType';
import { CategoriesResponseType } from '../../type/categoriesType';
import { CreateInsightResponseType, CreateInsightType, InsightType, UpdateInsightResponseType } from '../../type/InsightType';
import { HCPResponseType } from '../../type/HCPType';

import stages from '../../constants/stages';
import { PRIORITIES } from '../../constants/priorities';
import { INSIGHT_ACTIVITY_ACTIONS } from '../../constants/activityAction';

import { useMutation } from '@apollo/client/react';
import { supabase } from '../../lib/supabase';

import { getChangedFields, getInsightDiff } from '../../utils/insight-diff';

import {
  insightSchema,
  InsightFormValues,
} from './validation-schema';
import { LIST_HCPS } from '../../graphql/queries/listHCPs';
import { LIST_TAGS } from '../../graphql/queries/listTags';
import { LIST_CATEGORIES } from '../../graphql/queries/listCategories';
import { CREATE_INSIGHT } from '../../graphql/mutations/createInsight';
import { UPDATE_INSIGHT } from '../../graphql/mutations/updateInsight';
import { CREATE_INSIGHT_ACTIVITY } from '../../graphql/mutations/createInsigntActivity';
import { CREATE_INSIGHT_TAGS } from '../../graphql/mutations/createInsightTags';

import {
  Modal,
  Pressable,
  ScrollView,
  View,
  Alert,
} from 'react-native';
import {
  Button,
  Chip,
  IconButton,
  Portal,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import Toast from 'react-native-toast-message';

export default function CreateInsightForm({
  visible,
  setVisible,
  editFlow,
  insight,
  triggerRefetch,
  refetch,
}: {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  editFlow: boolean;
  insight: InsightType | null;
  triggerRefetch: boolean;
  refetch: () => void;
}) {
  const {
    control,
    handleSubmit,
    formState: {
      errors,
      isDirty,
      isValid,
    },
    reset,
  } = useForm<InsightFormValues>({
    resolver: zodResolver(insightSchema),

    mode: 'onChange',

    defaultValues: {
      title: '',
      description: '',
      priority: '',
      category: '',
      stage: '',
      linkedHCP: '',
      drugName: '',
      tags: [''],
    },
  });

  const [createInsight, { loading: creating }] = useMutation<CreateInsightResponseType>(CREATE_INSIGHT, {
    update(cache, { data }) {
      const newInsight = data?.insertIntoInsightsCollection?.records?.[0];

      if (!newInsight) return;

      cache.modify({
        fields: {
          insightsCollection(existingConnection = {}) {
            const newInsightRef = cache.writeFragment({
              data: newInsight,
              fragment: gql`
              fragment NewInsight on Insights {
                nodeId
                id
                title
                description
                stage
                priority
                columnOrder
                drugName
                customFields
                createdAt
                updatedAt
              }
            `,
            });

            return {
              ...existingConnection,

              edges: [
                {
                  __typename: 'InsightsEdge',
                  node: newInsightRef,
                },

                ...(existingConnection.edges || []),
              ],
            };
          },
        },
      });
    },
  });
  const [updateInsight, { loading: updating }] = useMutation<UpdateInsightResponseType>(UPDATE_INSIGHT, {
    update(cache, { data }) {
      const updatedInsight =
        data?.updateInsightsCollection?.records?.[0];

      if (!updatedInsight) return;

      if (triggerRefetch) {
        // In case filters are applied, refetch a fresh list of filtered insights
        refetch();
      } else {
        cache.writeFragment({
          id: cache.identify({
            __typename: 'Insights',
            id: updatedInsight.id,
          }),

          fragment: gql`
            fragment UpdatedInsight on Insights {
              title
              description
              stage
              priority
              columnOrder
              drugName
              customFields
              createdAt
              updatedAt

              hcp {
                nodeId
                id
                name
                specialty
                institution
              }

              category {
                nodeId
                id
                name
                color
              }

              insightTagsCollection {
                edges {
                  node {
                    tag {
                      id
                      name
                    }
                  }
                }
              }
            }
          `,

          data: {
            __typename: 'Insights',
            ...updatedInsight,
          },
        });
      }
    },
  });
  const loading = creating || updating;

  const [createInsightTags] = useMutation<CreateInsightTagsResponseType>(
    CREATE_INSIGHT_TAGS, {
    update(cache, { data }) {
      const newRows =
        data?.insertIntoInsightTagsCollection?.records;

      if (!newRows?.length) return;

      const insightNodeId = newRows[0].insight.nodeId;

      // write to cache
      const existingInsight: InsightType | null = cache.readFragment({
        id: cache.identify({
          __typename: 'Insights',
          nodeId: insightNodeId,
        }),

        fragment: gql`
          fragment ExistingInsight on Insights {
            nodeId
            id
            title
            description
            stage
            priority
            columnOrder
            drugName
            customFields
            createdAt
            updatedAt
          }
        `,
      });

      if (!existingInsight) return;

      // 2. Create new edges
      const newEdges = newRows.map((row: any) => ({
        __typename: 'InsightTagsEdge',

        node: {
          __typename: 'InsightTags',

          tag: {
            __typename: 'Tags',
            id: row.tag.id,
            name: row.tag.name,
          },
        },
      }));

      // 3. Write updated insight back
      cache.writeFragment({
        id: cache.identify({
          __typename: 'Insights',
          nodeId: insightNodeId,
        }),

        fragment: gql`
          fragment UpdatedInsight on Insights {
            nodeId
            id
            title
            description
            stage
            priority
            columnOrder
            drugName
            customFields
            createdAt
            updatedAt

            insightTagsCollection {
              edges {
                node {
                  tag {
                    id
                    name
                  }
                }
              }
            }
          }
        `,

        data: {
          ...existingInsight,

          insightTagsCollection: {
            ...existingInsight.insightTagsCollection,

            edges: [
              ...(existingInsight.insightTagsCollection?.edges || []),

              ...newEdges,
            ],
          },
        },
      });
    },
  });
  const [createInsightActivity] = useMutation(
    CREATE_INSIGHT_ACTIVITY
  );

  const [showHCPDropDown, setShowHCPDropDown] =
    useState(false);


  useEffect(() => {
    if (insight) {
      reset({
        title: insight.title,
        description: insight.description,
        priority: insight.priority,
        category: insight?.category?.id,
        stage: insight.stage,
        linkedHCP: insight?.hcp?.id,
        drugName: insight.drugName,
        tags: (insight.insightTagsCollection.edges ?? []).map((tag => tag.node.tag.id)),
      });
    }
  }, [insight]);

  const { data: tagsData, loading: loadingTags, error: tagsError, networkStatus: tagsNetworkStatus, } = useQuery<TagResponseType>(LIST_TAGS, {
    fetchPolicy: 'cache-and-network',
  });
  const isInitialLoadingTags = loadingTags && tagsNetworkStatus === NetworkStatus.loading;
  const tags = tagsData?.tagsCollection?.edges?.map(
    edge => edge.node
  ) ?? [];

  const { data: categoriesData, loading: loadingCategories, error: categoriesError, networkStatus: categoriesNetworkStatus, } = useQuery<CategoriesResponseType>(LIST_CATEGORIES, {
    fetchPolicy: 'cache-and-network',
  });
  const isInitialLoadingCategories = loadingCategories && categoriesNetworkStatus === NetworkStatus.loading;
  const categories = categoriesData?.categoriesCollection?.edges?.map(
    edge => edge.node
  ) ?? [];

  const { data: HCPData, loading: loadingHCPs, error: HCPsError, networkStatus: HCPNetworkStatus, } = useQuery<HCPResponseType>(LIST_HCPS, {
    fetchPolicy: 'cache-and-network',
  });
  const isInitialLoadingHCPs = loadingHCPs && HCPNetworkStatus === NetworkStatus.loading;
  const HCPs = HCPData?.hcpsCollection?.edges?.map(
    edge => edge.node
  ) ?? [];

  const handleClose = () => {
    if (isDirty) {
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              reset();
              setVisible(false);
            },
          },
        ]
      );

      return;
    }

    setVisible(false);
  };

  const onSubmit = async (
    values: InsightFormValues
  ) => {
    try {
      const currentUserId = await supabase.auth
        .getSession()
        .then(({ data }) => {
          return data.session?.user?.id;
        })
        .catch((error) => {
        });

      const payload: CreateInsightType = {
        title: values.title,
        priority: values.priority,
        stage: values.stage,
      }

      // Append optional fields
      if (values.description) payload['description'] = values.description;
      if (values.drugName) payload['drugName'] = values.drugName;
      if (values.linkedHCP) payload['hcpId'] = values.linkedHCP;
      if (values.category) payload['categoryId'] = values.category;

      if (editFlow) {
        const response = await updateInsight({
          variables: {
            filter: {
              id: {
                eq: insight?.id,
              },
            },
            set: payload,
          },
        });

        const updatedInsight = response.data?.updateInsightsCollection.records[0];
        if (updatedInsight && insight) {
          const diff = getChangedFields(
            insight,
            updatedInsight,
            {
              ignoreFields: [
                'updatedAt',
                'createdAt',
                'nodeId',
              ],
            }
          );

          const {
            fieldNames,
            oldValue,
            newValue,
          } = getInsightDiff(diff);
          await createInsightActivity({
            variables: {
              input: [
                {
                  insightId: insight.id,
                  userId: currentUserId,

                  action: INSIGHT_ACTIVITY_ACTIONS.EDIT,

                  fieldName: fieldNames.join(', '),
                  oldValue: JSON.stringify(oldValue),
                  newValue: JSON.stringify(newValue),
                },
              ],
            },
          });
        }

        Toast.show({
          type: 'success',
          text1: 'Insight saved',
          text2: `Your updated insight was successfully saved`,
          position: 'bottom',
        });
      } else {
        if (currentUserId) payload['createdBy'] = currentUserId;

        const result = await createInsight({
          variables: {
            input: [
              payload,
            ],
          },
        });

        const createdInsight =
          result.data?.insertIntoInsightsCollection?.records?.[0];

        if (createdInsight) {
          if (values.tags && values.tags.length > 0) {
            await createInsightTags({
              variables: {
                input: values.tags.map((tag) => ({
                  insightId: createdInsight.id,
                  tagId: tag
                }))
              },
            });
          }

          await createInsightActivity({
            variables: {
              input: [
                {
                  insightId: createdInsight.id,
                  userId: currentUserId,

                  action: INSIGHT_ACTIVITY_ACTIONS.CREATE,

                  fieldName: null,
                  oldValue: null,
                  newValue: createdInsight.title,
                },
              ],
            },
          });
        }

        Toast.show({
          type: 'success',
          text1: 'Insight created',
          text2: `Your insight was successfully created`,
          position: 'bottom',
        });
      }

      reset({
        title: '',
        description: '',
        priority: '',
        category: '',
        stage: '',
        linkedHCP: '',
        drugName: '',
        tags: [],
      });
      setVisible(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: JSON.stringify(error, null, 2),
        position: 'bottom',
      });
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={handleClose}
      >
        <Pressable
          style={styles.backdrop}
          onPress={handleClose}
        >
          <Pressable style={styles.sheetWrapper} onPress={() => setShowHCPDropDown(false)}>
            <Surface style={styles.sheet} elevation={1}>
              <View id="handle" style={styles.handle} />

              <Text variant="headlineSmall">
                {editFlow ? 'Edit' : 'Create'} Insight
                {editFlow && insight?.title ? ` "${insight?.title}"` : ''}
              </Text>

              <ScrollView
                contentContainerStyle={{
                  paddingBottom: 32,
                }}
                showsVerticalScrollIndicator={false}
              >
                <View style={{ flex: 1 }}>
                  {/* TITLE */}
                  <Controller
                    control={control}
                    name="title"
                    render={({ field }) => (
                      <TextInput
                        label="Title"
                        mode="outlined"
                        value={field.value}
                        onChangeText={field.onChange}
                        error={!!errors.title}
                        style={styles.field}
                      />
                    )}
                  />
                  {errors.title && (
                    <Text style={styles.error}>
                      {errors.title.message}
                    </Text>
                  )}

                  {/* DESCRIPTION */}
                  <Controller
                    control={control}
                    name="description"
                    render={({ field }) => (
                      <TextInput
                        label="Description"
                        mode="outlined"
                        multiline
                        numberOfLines={5}
                        value={field.value}
                        onChangeText={field.onChange}
                        error={!!errors.description}
                        style={styles.field}
                      />
                    )}
                  />
                  {errors.description && (
                    <Text style={styles.error}>
                      {errors.description.message}
                    </Text>
                  )}

                  {/* PRIORITY */}
                  <Controller
                    control={control}
                    name="priority"
                    render={({ field }) => (
                      <View style={{ marginTop: 16, flexDirection: 'column', gap: 8 }}>
                        <Text variant="titleSmall">Priority</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {PRIORITIES.map((p) => (
                            <Chip
                              key={p}
                              selected={field.value === p}
                              onPress={() => field.onChange(p)}
                              mode={field.value === p ? 'flat' : 'outlined'}
                              style={{
                                borderRadius: 999,
                              }}
                            >
                              {p}
                            </Chip>
                          ))}
                        </View>
                      </View>
                    )}
                  />
                  {errors.priority && (
                    <Text style={styles.error}>
                      {errors.priority.message}
                    </Text>
                  )}

                  {/* CATEGORY */}
                  <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <View style={{ marginTop: 16, flexDirection: 'column', gap: 8 }}>
                        <Text variant="titleSmall">Category</Text>
                        {isInitialLoadingCategories && (
                          <View style={{
                            flex: 1,
                            padding: 8,
                            justifyContent: 'center',
                          }}>
                            <Text style={{ textAlign: 'center' }}>Loading...</Text>
                          </View>
                        )}
                        {categoriesError && (
                          <View style={{
                            padding: 16,
                            borderWidth: 1,
                            borderColor: "#F44336",
                            borderRadius: 4,
                            backgroundColor: "rgba(244, 67, 54, 0.1)"
                          }}>
                            <Text>Encountered error while fetching categories: {categoriesError?.message}</Text>
                          </View>
                        )}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {categories?.map((category) => (
                            <Chip
                              key={category.id}
                              selected={field.value === category.id}
                              onPress={() => {
                                if (field.value === category.id) field.onChange('');
                                else field.onChange(category.id)
                              }}
                              mode={field.value === category.id ? 'flat' : 'outlined'}
                              style={{
                                borderRadius: 999,
                                backgroundColor: category.color,
                              }}
                              textStyle={{
                                color: "#fff",
                                fontWeight: '700',
                              }}
                            >
                              {category.name}
                            </Chip>
                          ))}
                        </View>
                      </View>
                    )}
                  />

                  {/* STAGE */}
                  <Controller
                    control={control}
                    name="stage"
                    render={({ field }) => (
                      <View style={{ marginTop: 16, flexDirection: 'column', gap: 8 }}>
                        <Text variant="titleSmall">Stage</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {stages.map((stage) => (
                            <Chip
                              key={stage}
                              selected={field.value === stage}
                              onPress={() => {
                                if (field.value === stage) field.onChange('');
                                else field.onChange(stage)
                              }}
                              mode={field.value === stage ? 'flat' : 'outlined'}
                              style={{
                                borderRadius: 999,
                              }}
                            >
                              {stage}
                            </Chip>
                          ))}
                        </View>
                      </View>
                    )}
                  />

                  {/* LINKED HCP */}
                  <Controller
                    control={control}
                    name="linkedHCP"
                    render={({ field }) => {
                      const selectedHCP = HCPs.find(hcp => hcp.id === field.value)?.name;

                      return (
                        <View style={{ marginTop: 16, flexDirection: 'column', gap: 8 }}>
                          <Text variant="titleSmall">Linked HCP</Text>
                          {HCPsError && (
                            <View style={{
                              padding: 16,
                              borderWidth: 1,
                              borderColor: "#F44336",
                              borderRadius: 4,
                              backgroundColor: "rgba(244, 67, 54, 0.1)"
                            }}>
                              <Text>Encountered error while fetching HCPs: {HCPsError?.message}</Text>
                            </View>
                          )}
                          <View style={{ position: 'relative', }}>
                            <Pressable onPress={() => setShowHCPDropDown(true)}>
                              <TextInput
                                mode="outlined"
                                placeholder={isInitialLoadingHCPs ? 'Loading...' : 'Search HCPs'}
                                value={selectedHCP}
                                // onChangeText={field.onChange}
                                style={[styles.field, { marginTop: 0 }]}
                                onPress={() => setShowHCPDropDown(true)}
                                readOnly
                              />
                            </Pressable>
                            {selectedHCP && (
                              <IconButton
                                icon="close"
                                style={{
                                  position: 'absolute',
                                  right: 0,
                                }}
                                onPress={() => { field.onChange(null); }}
                              />
                            )}

                            {showHCPDropDown && (
                              <View style={{
                                position: 'absolute',
                                top: '100%',
                                height: 200,
                                width: "100%",
                                backgroundColor: '#000',
                                zIndex: 10,
                              }}>
                                <ScrollView>
                                  {HCPs.map((hcp) => (
                                    <View
                                      key={hcp.id}
                                      style={{
                                        borderBottomWidth: 1,
                                        borderColor: 'gray',
                                        marginHorizontal: 16,
                                        flex: 1,
                                      }}
                                    >
                                      <Pressable
                                        style={{
                                          paddingVertical: 16,
                                          flex: 1,
                                          flexDirection: 'row',
                                          justifyContent: 'space-between',
                                        }}
                                        onPress={() => {
                                          field.onChange(hcp.id);
                                          setShowHCPDropDown(false);
                                        }}
                                      >
                                        <Text>{hcp.name}</Text>
                                        <View style={{
                                          flex: 1,
                                          flexDirection: 'column',
                                          alignItems: 'flex-end',
                                        }}>
                                          <Text variant='bodySmall' style={{ color: 'gray' }}>{hcp.specialty}</Text>
                                          <Text variant='bodySmall' style={{ color: 'gray' }}>{hcp.institution}</Text>
                                        </View>
                                      </Pressable>
                                    </View>
                                  ))}
                                </ScrollView>
                              </View>
                            )}
                          </View>
                        </View>
                      )
                    }}
                  />

                  {/* DRUG NAME */}
                  <Controller
                    control={control}
                    name="drugName"
                    render={({ field }) => (
                      <TextInput
                        label="Drug Name"
                        mode="outlined"
                        value={field.value}
                        onChangeText={field.onChange}
                        style={styles.field}
                      />
                    )}
                  />

                  {/* TAGS */}
                  <Controller
                    control={control}
                    name="tags"
                    render={({ field }) => (
                      <View style={{ marginTop: 16, flexDirection: 'column', gap: 8 }}>
                        <Text variant="titleSmall">Tags</Text>
                        {isInitialLoadingTags && (
                          <View style={{
                            flex: 1,
                            padding: 8,
                            justifyContent: 'center',
                          }}>
                            <Text style={{ textAlign: 'center' }}>Loading...</Text>
                          </View>
                        )}
                        {tagsError && (
                          <View style={{
                            padding: 16,
                            borderWidth: 1,
                            borderColor: "#F44336",
                            borderRadius: 4,
                            backgroundColor: "rgba(244, 67, 54, 0.1)"
                          }}>
                            <Text>Encountered error while fetching tags: {tagsError?.message}</Text>
                          </View>
                        )}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {tags?.map((currentTag) => (
                            <Chip
                              key={currentTag.id}
                              selected={field.value?.includes(currentTag.id)}
                              onPress={() => {
                                let updatedSelection = field.value;
                                if (updatedSelection?.includes(currentTag.id)) {
                                  updatedSelection = updatedSelection.filter((tag) => tag !== currentTag.id);
                                } else {
                                  updatedSelection?.push(currentTag.id)
                                }
                                field.onChange(updatedSelection);
                              }}
                              mode={field.value?.includes(currentTag.id) ? 'flat' : 'outlined'}
                              style={{
                                borderRadius: 999,
                              }}
                            >
                              {currentTag.name}
                            </Chip>
                          ))}
                        </View>
                      </View>
                    )}
                  />
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <Button
                  mode="outlined"
                  onPress={handleClose}
                  style={styles.button}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  loading={loading}
                  disabled={!isValid}
                  onPress={handleSubmit(onSubmit)}
                  style={styles.button}
                >
                  {editFlow ? 'Save' : 'Create'}
                </Button>
              </View>
            </Surface>
          </Pressable>
        </Pressable>
      </Modal>
    </Portal >
  );
}
