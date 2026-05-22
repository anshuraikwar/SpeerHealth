import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client/react';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { TagResponseType } from '../../type/tagType';
import { CategoriesResponseType } from '../../type/categoriesType';
import { InsightType } from '../../type/InsightType';
import { HCPResponseType } from '../../type/HCPType';

import stages from '../../constants/stages';
import { PRIORITIES } from '../../constants/priorities';

import { useMutation } from '@apollo/client/react';
import { supabase } from '../../lib/supabase';

import {
  insightSchema,
  InsightFormValues,
} from './validation-schema';
import { LIST_HCPS } from '../../graphql/queries/listHCPs';
import { LIST_TAGS } from '../../graphql/queries/listTags';
import { LIST_CATEGORIES } from '../../graphql/queries/listCategories';
import { CREATE_INSIGHT } from '../../graphql/mutations/createInsight';
import { UPDATE_INSIGHT } from '../../graphql/mutations/updateInsight';

import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Alert,
} from 'react-native';
import {
  Button,
  Chip,
  Portal,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';

export default function CreateInsightForm({
  visible,
  setVisible,
  editFlow,
  insight,
}: {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  editFlow: boolean;
  insight: InsightType;
}) {
  const mutation = editFlow
    ? UPDATE_INSIGHT
    : CREATE_INSIGHT;
  const [createOrUpdateInsight, { loading }] = useMutation(mutation);

  const [showHCPDropDown, setShowHCPDropDown] =
    useState(false);

  const {
    control,
    handleSubmit,
    formState: {
      errors,
      isDirty,
      isValid,
    },
    reset,
    watch,
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

  const { data: tagsData, loading: loadingTags, error: tagsError } = useQuery<TagResponseType>(LIST_TAGS, {
    fetchPolicy: 'network-only',
  });
  const tags = tagsData?.tagsCollection?.edges?.map(
    edge => edge.node
  ) ?? [];

  const { data: categoriesData, loading: loadingCategories, error: categoriesError } = useQuery<CategoriesResponseType>(LIST_CATEGORIES, {
    fetchPolicy: 'network-only',
  });
  const categories = categoriesData?.categoriesCollection?.edges?.map(
    edge => edge.node
  ) ?? [];

  const { data: HCPData, loading: loadingHCPs, error: HCPError } = useQuery<HCPResponseType>(LIST_HCPS, {
    fetchPolicy: 'network-only',
  });
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
      const userId = await supabase.auth
        .getSession()
        .then(({ data }) => {
          return data.session?.user?.id;
        })
        .catch((error) => {
        });

      const payload: any = {
        title: values.title,
        description: values.description,
        priority: values.priority,
        stage: values.stage,
        drugName: values.drugName,
      }
      if (editFlow) {
        payload['hcpId'] = values.linkedHCP;
        payload['categoryId'] = values.category;

        await createOrUpdateInsight({
          variables: {
            filter: {
              id: {
                eq: insight?.id,
              },
            },
            set: payload,
          },
        });
      } else {
        payload['createdBy'] = userId;
        await createOrUpdateInsight({
          variables: {
            input: [
              payload,
            ],
          },
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
      onSuccess();
    } catch (err) {
      console.log(err);
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
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {categories?.map((category) => (
                            <Chip
                              key={category.id}
                              selected={field.value === category.id}
                              onPress={() => field.onChange(category.id)}
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
                              onPress={() => field.onChange(stage)}
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
                        <View style={{ position: 'relative', }}>
                          <Pressable onPress={() => setShowHCPDropDown(true)}>
                            <TextInput
                              label="Linked HCP"
                              mode="outlined"
                              placeholder='Search HCPs'
                              value={selectedHCP}
                              onChangeText={field.onChange}
                              style={styles.field}
                              onPress={() => setShowHCPDropDown(true)}
                              readOnly
                            />
                          </Pressable>
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

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  sheetWrapper: {
    width: '100%',
    maxHeight: '85%',
    padding: 0,
    flex: 1,
    overflow: 'hidden',
  },

  sheet: {
    height: '100%',
    padding: 24,
    paddingTop: 8,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderRadius: 20,
    margin: 0,
    flex: 1,
    justifyContent: 'center',
  },

  handle: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C4C7C5',
    alignSelf: 'center',
    marginBottom: 16,
  },

  field: {
    marginTop: 16,
  },

  error: {
    color: 'red',
    marginTop: 4,
  },

  footer: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 20,
  },

  button: {
    flex: 1,
  },
});
