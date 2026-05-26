import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { NetworkStatus } from '@apollo/client';

import { Controller, useForm } from 'react-hook-form';

import { styles } from './styles';

import { TagResponseType, TagType } from '../../../../type/tagType';
import { CategoriesResponseType } from '../../../../type/categoriesType';
import { HCPResponseType } from '../../../../type/HCPType';

import stages from '../../../../constants/stages';
import { PRIORITIES } from '../../../../constants/priorities';

import {
  InsightFormValues,
} from './validation-schema';
import { LIST_HCPS } from '../../../../graphql/queries/listHCPs';
import { LIST_TAGS } from '../../../../graphql/queries/listTags';
import { LIST_CATEGORIES } from '../../../../graphql/queries/listCategories';

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

export default function FiltersBottomSheet({
  visible,
  setVisible,
  filters,
  onApply,
  onClear,
}: {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  filters: any;
  onApply: (filters: any) => void;
  onClear: () => void;
}) {
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
  } = useForm<InsightFormValues>({
    // resolver: zodResolver(insightSchema),

    mode: 'onChange',

    // TODO: UNDO
    defaultValues: {
      priorities: [],
      category: '',
      stage: '',
      linkedHCP: '',
      tags: [],
    },
  });

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      reset({
        priorities: filters.priorities ?? [],
        category: filters?.category?.id ?? '',
        stage: filters.stage ?? '',
        linkedHCP: filters?.hcp?.id ?? '',
        tags: (filters.tags ?? []).map((tag: TagType) => tag.id),
      });
    }
  }, [filters]);

  const { data: tagsData, loading: loadingTags, error: tagsError, networkStatus: tagsNetworkStatus, } = useQuery<TagResponseType>(LIST_TAGS, {
    fetchPolicy: 'cache-and-network',
  });
  const isInitialLoadingTags = loadingTags && tagsNetworkStatus === NetworkStatus.loading;
  const tags = tagsData?.tagsCollection?.edges?.map(
    edge => edge.node
  ) ?? [];

  const { data: categoriesData, loading: loadingCategories, error: categoriesError, networkStatus: categoriesNetworkStatus } = useQuery<CategoriesResponseType>(LIST_CATEGORIES, {
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
      const payload: any = {};

      if (values.priorities && values.priorities.length > 0) payload['priorities'] = values.priorities;
      if (values.category) payload['category'] = categories.find((cat) => cat.id === values.category);
      if (values.stage) payload['stage'] = values.stage;
      if (values.linkedHCP) payload['hcp'] = HCPs.find((hcp) => hcp.id === values.linkedHCP);
      if (values.tags && values.tags.length > 0) payload['tags'] = tags.filter((tag) => values.tags?.includes(tag.id));

      onApply(payload);
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
                Filters
              </Text>

              <ScrollView
                contentContainerStyle={{
                  paddingBottom: 32,
                }}
                showsVerticalScrollIndicator={false}
              >
                <View style={{ flex: 1 }}>
                  {/* PRIORITY */}
                  <Controller
                    control={control}
                    name="priorities"
                    render={({ field }) => (
                      <View style={{ marginTop: 16, flexDirection: 'column', gap: 8 }}>
                        <Text variant="titleSmall">Priorities</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {PRIORITIES.map((p) => (
                            <Chip
                              key={p}
                              selected={field.value?.includes(p)}
                              onPress={() => {
                                let updatedSelection = field.value;
                                if (updatedSelection?.includes(p)) {
                                  updatedSelection = updatedSelection.filter((tag) => tag !== p);
                                } else {
                                  updatedSelection?.push(p)
                                }
                                field.onChange(updatedSelection);
                              }}
                              mode={field.value?.includes(p) ? 'flat' : 'outlined'}
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
                  {errors.priorities && (
                    <Text style={styles.error}>
                      {errors.priorities.message}
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
                            <Pressable style={{ margin: 0 }} onPress={() => setShowHCPDropDown(true)}>
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
                  onPress={onClear}
                  style={styles.button}
                >
                  Clear All
                </Button>
                <Button
                  mode="contained"
                  // loading={loading}
                  disabled={!isValid}
                  onPress={handleSubmit(onSubmit)}
                  style={styles.button}
                >
                  Apply
                </Button>
              </View>
            </Surface>
          </Pressable>
        </Pressable>
      </Modal>
    </Portal >
  );
}
