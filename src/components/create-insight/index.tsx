import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { NetworkStatus } from '@apollo/client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { styles } from './styles';

import { CreateInsightTagsResponseType } from '../../type/tagType';
import { CreateInsightResponseType, CreateInsightType, InsightType, UpdateInsightResponseType } from '../../type/InsightType';

import stages from '../../constants/stages';
import { PRIORITIES } from '../../constants/priorities';
import { INSIGHT_ACTIVITY_ACTIONS } from '../../constants/activityAction';

import { useMutation } from '@apollo/client/react';
import { supabase } from '../../lib/supabase';

import { getChangedFields, getInsightDiff } from '../../utils/insight-diff';
import { capitalize } from '../../utils/string-utils';

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

type FieldType = 'text' | 'number' | 'date' | 'select';
type CustomFieldDef =
  | {
    key: string;
    label: string;
    type: 'text' | 'number' | 'date';
  }
  | {
    key: string;
    label: string;
    type: 'select';
    options: string[];
  };
type CustomFieldType =
  | {
    key: string;
    label: string;
    type: 'text' | 'number' | 'date';
    value: string;
    labelTouched: boolean;
    valueTouched: boolean;
  }
  | {
    key: string;
    label: string;
    type: 'select';
    value: string;
    open?: boolean;
    options: string[];
    labelTouched: boolean;
    valueTouched: boolean;
    optionsTouched: boolean[];
  };

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
      tags: [],
    },
  });

  const [customFields, setCustomFields] = useState<Record<string, CustomFieldType>>({});

  function createField(type: FieldType) {
    let customFieldObj: CustomFieldType;

    if (type === 'select') {
      customFieldObj = {
        key: new Date().toISOString(),
        label: '',
        type: 'select',
        value: '',
        open: false,
        options: [],
        labelTouched: false,
        valueTouched: false,
        optionsTouched: [],
      };
    } else {
      customFieldObj = {
        key: new Date().toISOString(),
        label: '',
        type,
        labelTouched: false,
        valueTouched: false,
        value: '',
      };
    }

    return customFieldObj;
  }

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

  const [showHCPDropDown, setShowHCPDropDown] = useState(false);
  const [showCustomFieldsDropDown, setShowCustomFieldsDropDown] = useState(false);


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

  const { data: tagsData, loading: loadingTags, error: tagsError, networkStatus: tagsNetworkStatus, } = useQuery(LIST_TAGS, {
    fetchPolicy: 'cache-and-network',
  });
  const isInitialLoadingTags = loadingTags && tagsNetworkStatus === NetworkStatus.loading;
  const tags = tagsData?.tagsCollection?.edges?.map(
    edge => edge.node
  ) ?? [];

  const { data: categoriesData, loading: loadingCategories, error: categoriesError, networkStatus: categoriesNetworkStatus, } = useQuery(LIST_CATEGORIES, {
    fetchPolicy: 'cache-and-network',
  });
  const isInitialLoadingCategories = loadingCategories && categoriesNetworkStatus === NetworkStatus.loading;
  const categories = categoriesData?.categoriesCollection?.edges?.map(
    edge => edge.node
  ) ?? [];

  const { data: HCPData, loading: loadingHCPs, error: HCPsError, networkStatus: HCPNetworkStatus, } = useQuery(LIST_HCPS, {
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
      console.log('currentUserId: ', currentUserId);

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

      let customFieldValid = true;
      if (Object.keys(customFields).length > 0) {
        const userPreferences: CustomFieldDef[] = [];
        const customFieldsPayload = Object.values(customFields).reduce<Record<string, string>>((acc, curr) => {
          if (curr.label.trim().length > 0 && curr.value.trim().length > 0) {
            const key = curr.label.split(' ').filter(str => str.length > 0).join('_').toLowerCase();
            let customFieldObj: CustomFieldDef;

            if (curr.type === 'select') {
              customFieldObj = {
                key,
                label: curr.label,
                type: 'select',
                options: curr.options.filter(op => op.trim().length > 0),
              };
            } else {
              customFieldObj = {
                key,
                label: curr.label,
                type: curr.type,
              };
            }
            userPreferences.push(customFieldObj);
            acc[key] = curr.value;
          } else {
            customFieldValid = false;
          }
          return acc;
        }, {});

        payload.customFields = JSON.stringify(customFieldsPayload);
        // [{"key": "custom_text_field", "label": "Custom text field", "type": "text"}, {"key": "custom_number_field", "label": "Custom number field", "type": "number"}, {"key": "custom_select_field", "label": "Custom select field", "options": ["Option 1", "Option 2", "Option 3"], "type": "select"}]
      }

      if (!customFieldValid) {
        console.error(
          'Custom Field values inputs cannot be empty',
        )
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'Custom Field values inputs cannot be empty',
          position: 'bottom',
        });
        return;
      }

      if (editFlow && insight) {
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
          console.log('values.tags: ', values.tags);
          if (values.tags && values.tags.length > 0) {
            console.log('creating tags')
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
      console.error('ERROR', JSON.stringify(error, null, 2));
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
                  paddingBottom: 200,
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
                                label="Linked HCP"
                                mode="outlined"
                                placeholder={isInitialLoadingHCPs ? 'Loading...' : 'Select'}
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
                                  top: 4,
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

                  {/* CUSTOM FIELDS */}
                  <View style={{ marginTop: 32, flexDirection: 'column', gap: 8 }}>
                    <Text variant="titleSmall">Custom Fields</Text>
                    <View style={{ position: 'relative', }}>
                      <Button
                        compact
                        mode="outlined"
                        style={{
                          borderRadius: 4,
                        }}
                        onPress={() => setShowCustomFieldsDropDown(true)}
                      >
                        + Add Field
                      </Button>

                      {showCustomFieldsDropDown && (
                        <View style={{
                          position: 'absolute',
                          top: '100%',
                          height: 200,
                          width: "100%",
                          borderRadius: 4,
                          backgroundColor: 'rgb(30, 28, 33)',
                          zIndex: 10,
                        }}>
                          <ScrollView>
                            {['text', 'number', 'select'].map((type) => (
                              <View
                                key={type}
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
                                    let customFieldObj = createField(type as FieldType);

                                    console.log(
                                      'id: ', new Date().toISOString(),
                                      'type: ', customFieldObj,
                                    );
                                    setCustomFields((prev) => ({
                                      ...prev,
                                      [customFieldObj.key]: customFieldObj,
                                    }));
                                    setShowCustomFieldsDropDown(false);
                                  }}
                                >
                                  <Text>{capitalize(type)}</Text>
                                </Pressable>
                              </View>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  </View>

                  {Object.keys(customFields).map((fieldKey) => {
                    const config = customFields[fieldKey];

                    if (config.type === 'text' || config.type === 'number') return (
                      <View key={fieldKey} style={{
                        paddingVertical: 6,
                        paddingHorizontal: 8,
                        marginTop: 12,

                        borderWidth: 0.5,
                        borderColor: 'rgb(73, 69, 79)',
                        borderRadius: 4,

                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}>
                        <Text>{capitalize(config.type)}</Text>
                        <View style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignContent: 'center',
                          gap: 4,
                        }}>
                          <View style={{ flex: 1 }}>
                            <TextInput
                              dense
                              label="Label"
                              mode="outlined"
                              value={config.label}
                              onChangeText={(value) => {
                                setCustomFields((prev) => {
                                  const clone = { ...prev };
                                  clone[fieldKey].label = value;
                                  if ('labelTouched' in clone[fieldKey]) clone[fieldKey].labelTouched = true;
                                  return clone;
                                })
                              }}
                              error={config.labelTouched && config.label.trim().length === 0}
                              style={[styles.field, { flex: 1, marginTop: 0 }]}
                            />
                            {(config.labelTouched && config.label.trim().length === 0) && (
                              <Text style={styles.error}>
                                Label cannot be empty
                              </Text>
                            )}
                          </View>
                          <IconButton
                            mode="outlined"
                            icon="delete"
                            style={{ borderRadius: 4 }}
                            onPress={() => {
                              setCustomFields((prev) => {
                                const clone = { ...prev };
                                delete clone[fieldKey];
                                return clone;
                              })
                            }}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <TextInput
                            dense
                            label="Value"
                            mode="outlined"
                            keyboardType={config.type === 'number' ? 'numeric' : undefined}
                            value={config.value}
                            onChangeText={(value) => {
                              setCustomFields((prev) => {
                                const clone = { ...prev };
                                clone[fieldKey].value = value;
                                if ('valueTouched' in clone[fieldKey]) clone[fieldKey].valueTouched = true;
                                return clone;
                              })
                            }}
                            error={config.valueTouched && config.value.trim().length === 0}
                            style={[styles.field, { marginTop: 0 }]}
                          />
                          {(config.valueTouched && config.value.trim().length === 0) && (
                            <Text style={styles.error}>
                              Value cannot be empty
                            </Text>
                          )}
                        </View>
                      </View>
                    )
                    if (config.type === 'select') return (
                      <View key={fieldKey} style={{
                        paddingVertical: 6,
                        paddingHorizontal: 8,
                        marginTop: 12,

                        borderWidth: 0.5,
                        borderColor: 'rgb(73, 69, 79)',
                        borderRadius: 4,

                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}>
                        <Text>{capitalize(config.type)}</Text>
                        <View style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignContent: 'center',
                          gap: 4,
                        }}>
                          <View style={{ flex: 1 }}>
                            <TextInput
                              dense
                              label="Label"
                              mode="outlined"
                              value={config.label}
                              onChangeText={(value) => {
                                setCustomFields((prev) => {
                                  const clone = { ...prev };
                                  clone[fieldKey].label = value;
                                  clone[fieldKey].labelTouched = true;
                                  return clone;
                                })
                              }}
                              error={config.labelTouched && config.label.trim().length === 0}
                              style={[styles.field, { flex: 1, marginTop: 0 }]}
                            />
                            {(config.labelTouched && config.label.trim().length === 0) && (
                              <Text style={styles.error}>
                                Label cannot be empty
                              </Text>
                            )}
                          </View>
                          <IconButton
                            mode="outlined"
                            icon="delete"
                            style={{ margin: 0, marginTop: 7, borderRadius: 4 }}
                            onPress={() => {
                              setCustomFields((prev) => {
                                const clone = { ...prev };
                                delete clone[fieldKey];
                                return clone;
                              })
                            }}
                          />
                        </View>
                        <View style={{
                          paddingVertical: 6,
                          paddingHorizontal: 8,
                          marginTop: 12,

                          borderWidth: 0.5,
                          borderColor: 'rgb(73, 69, 79)',
                          borderRadius: 4,

                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                        }}>
                          <Text>{capitalize('options')}</Text>
                          {config.options.map((option, index) => {
                            return (
                              <View key={`option-${index}`} style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignContent: 'center',
                                gap: 4,
                              }}>
                                <View style={{ flex: 1 }}>
                                  <TextInput
                                    dense
                                    label="Option"
                                    mode="outlined"
                                    value={option}
                                    onChangeText={(value) => {
                                      setCustomFields((prev) => {
                                        const clone = { ...prev };
                                        if ('options' in clone[fieldKey]) clone[fieldKey].options[index] = value;
                                        if ('optionsTouched' in clone[fieldKey]) clone[fieldKey].optionsTouched[index] = true;
                                        return clone;
                                      })
                                    }}
                                    error={config.optionsTouched[index] && option.trim().length === 0}
                                    style={[styles.field, { flex: 1, marginTop: 0 }]}
                                  />
                                  {(config.optionsTouched[index] && option.trim().length === 0) && (
                                    <Text style={styles.error}>
                                      Option cannot be empty
                                    </Text>
                                  )}
                                </View>
                                <IconButton
                                  mode="outlined"
                                  icon="delete"
                                  style={{ margin: 0, marginTop: 7, borderRadius: 4 }}
                                  onPress={() => {
                                    setCustomFields((prev) => {
                                      const clone = { ...prev };
                                      if ('options' in clone[fieldKey]) clone[fieldKey].options.splice(index, 1);
                                      return clone;
                                    })
                                  }}
                                />
                              </View>
                            )
                          })}
                          <Button
                            compact
                            mode="outlined"
                            style={{
                              borderRadius: 4,
                            }}
                            onPress={() => {
                              setCustomFields((prev) => {
                                const clone = { ...prev };
                                if ('options' in clone[fieldKey]) clone[fieldKey].options.push('');
                                return clone;
                              })
                            }}
                          >
                            + Add Option
                          </Button>
                        </View>

                        <View style={{ position: 'relative', }}>
                          <View style={{ flex: 1 }}>
                            <TextInput
                              dense
                              mode="outlined"
                              placeholder={`Select ${config.label}`}
                              value={config.value}
                              // onChangeText={field.onChange}
                              style={[styles.field, { marginTop: 0 }]}
                              onPress={() => {
                                setCustomFields((prev) => {
                                  const clone = { ...prev };
                                  if ('open' in clone[fieldKey]) clone[fieldKey].open = true;
                                  return clone;
                                })
                              }}
                              readOnly
                              error={config.valueTouched && config.value.trim().length === 0}
                              disabled={config.options.length === 0}
                            />
                            {(config.valueTouched && config.value.trim().length === 0) && (
                              <Text style={styles.error}>
                                Value cannot be empty
                              </Text>
                            )}
                          </View>
                          {config.value && (
                            <IconButton
                              icon="close"
                              style={{
                                position: 'absolute',
                                right: 0,
                              }}
                              onPress={() => {
                                setCustomFields((prev) => {
                                  const clone = { ...prev };
                                  if ('value' in clone[fieldKey]) clone[fieldKey].value = '';
                                  if ('open' in clone[fieldKey]) clone[fieldKey].open = false;
                                  return clone;
                                })
                              }}
                            />
                          )}
                          {config.open && (
                            <View style={{
                              position: 'absolute',
                              top: '100%',
                              height: 200,
                              width: "100%",
                              backgroundColor: '#000',
                              zIndex: 10,
                            }}>
                              <ScrollView>
                                {config.options.map((option, index) => (
                                  <View
                                    key={`${option}-${index}`}
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
                                        setCustomFields((prev) => {
                                          const clone = { ...prev };
                                          if ('value' in clone[fieldKey]) clone[fieldKey].value = option;
                                          if ('open' in clone[fieldKey]) clone[fieldKey].open = false;
                                          if ('valueTouched' in clone[fieldKey]) clone[fieldKey].valueTouched = true;
                                          return clone;
                                        });
                                      }}
                                    >
                                      <Text>{option}</Text>
                                    </Pressable>
                                  </View>
                                ))}
                              </ScrollView>
                            </View>
                          )}
                        </View>
                      </View>
                    )

                    return null;
                  })}
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
