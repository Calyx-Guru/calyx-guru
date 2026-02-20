import FloatingHeader from '@/components/home/FloatingHeader';
import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import { SupabaseAuthContext } from '@/contexts/SupabaseAuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import supabase from '@/lib/supabase/client';
import { UserProfile } from '@/types/profile';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

interface PersonalInfo {
  profilePictureUrl?: string;
  nickname?: string;
  fullName?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  address?: string;
  phoneNumber?: string;
}

export default function PersonalInformationScreen() {
  const {
    colors,
    spacing,
    fontRegistry,
    fontsLoaded,
    fallbackFontRegistry,
    fontSize,
  } = useContext(AppAppearanceContext);
  const { user } = useContext(SupabaseAuthContext);
  const {
    profile,
    isLoading,
    loadProfileFromRemote,
    updateProfileToRemote,
    updateProfileToLocalStorage,
  } = useUserProfile();

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    profilePictureUrl: profile?.avatar_url || undefined,
    nickname: profile?.username || undefined,
    fullName: profile?.full_name || undefined,
    birthDate: profile?.date_of_birth || undefined,
    gender: profile?.gender || undefined,
    maritalStatus: profile?.family_status || undefined,
    address: profile?.location || undefined,
    phoneNumber: profile?.phone_number || undefined,
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(
    personalInfo.birthDate ? new Date(personalInfo.birthDate) : new Date(),
  );
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showMaritalStatusModal, setShowMaritalStatusModal] = useState(false);

  const fontRegistryToUse = fontsLoaded ? fontRegistry : fallbackFontRegistry;

  // Auto-save function
  const saveToDatabase = async (dataToSave: PersonalInfo) => {
    // clone dataToSave and filter out undefined values
    const filteredData: Record<string, any> = {};
    Object.keys(dataToSave).forEach((key) => {
      const value = (dataToSave as any)[key];
      if (value !== undefined) {
        filteredData[key] = value;
      }
    });
    const updateData: Partial<UserProfile> = {
      username: filteredData.nickname || undefined,
      avatar_url: filteredData.profilePictureUrl || undefined,
      full_name: filteredData.fullName || undefined,
      date_of_birth: filteredData.birthDate || undefined,
      gender: filteredData.gender || undefined,
      family_status: filteredData.maritalStatus || undefined,
      location: filteredData.address || undefined,
      phone_number: filteredData.phoneNumber || undefined,
    };

    updateProfileToLocalStorage(updateData);

    if (!user?.id) return;
    try {
      setIsUpdating(true);

      await updateProfileToRemote(user.id, updateData);
    } catch (err) {
      console.error('Error saving to database:', err);

      setPersonalInfo({
        profilePictureUrl: profile?.avatar_url || undefined,
        nickname: profile?.username || undefined,
        fullName: profile?.full_name || undefined,
        birthDate: profile?.date_of_birth || undefined,
        gender: profile?.gender || undefined,
        maritalStatus: profile?.family_status || undefined,
        address: profile?.location || undefined,
        phoneNumber: profile?.phone_number || undefined,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Update personal info and trigger auto-save
  const updatePersonalInfo = (updates: Partial<PersonalInfo>) => {
    const newInfo = { ...personalInfo, ...updates };
    setPersonalInfo(newInfo);
    saveToDatabase(newInfo);
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Sign Out',
        onPress: async () => {
          try {
            await supabase.auth.signOut();
            router.replace('/(auth)/SignIn');
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
          }
        },
      },
    ]);
  };

  const handleEditField = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value || '');
    if (field === 'birthDate' && value) {
      setSelectedDate(new Date(value));
    }
  };

  const handleSaveField = async () => {
    if (editingField === 'birthDate') {
      // Save date
      const newDate = selectedDate.toISOString().split('T')[0];
      updatePersonalInfo({
        birthDate: newDate,
      });
    } else if (editingField) {
      updatePersonalInfo({
        [editingField]: editValue,
      });
    }
    setEditingField(null);
    setEditValue('');
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const renderInfoLine = (
    label: string,
    fieldName: string,
    value: string | undefined,
  ) => (
    <Pressable
      style={[
        styles.infoLine,
        {
          borderBottomColor: colors.outline,
          paddingHorizontal: spacing.layout.md,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
      ]}
      onPress={() => handleEditField(fieldName, value || '')}
    >
      <Text
        style={{
          fontFamily: fontRegistryToUse.body,
          fontSize: fontSize.md,
          color: colors.onSurfaceVariant,
          flex: 0.5,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: fontRegistryToUse.body,
          fontSize: fontSize.md,
          color: colors.onSurface,
          flex: 0.5,
          textAlign: 'right',
        }}
      >
        {value || 'Not set'}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.onSurfaceVariant}
        style={{ marginLeft: spacing.layout.md }}
      />
    </Pressable>
  );

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FloatingHeader
      title="Personal Information"
      leftButton={
        <Pressable
          onPress={() => router.back()}
          style={{ paddingHorizontal: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.onPrimary} />
        </Pressable>
      }
      rightButton={
        <Pressable onPress={handleLogout} style={{ paddingHorizontal: 12 }}>
          <Ionicons name="log-out" size={24} color={colors.onPrimary} />
        </Pressable>
      }
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingVertical: spacing.layout.md }}
      >
        {/* Profile Picture Section */}
        <Pressable
          style={{
            alignItems: 'center',
            paddingVertical: spacing.layout.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.outline,
          }}
        >
          {personalInfo.profilePictureUrl ? (
            <Image
              source={{ uri: personalInfo.profilePictureUrl }}
              style={styles.profilePicture}
            />
          ) : (
            <View
              style={[
                styles.profilePicture,
                {
                  backgroundColor: colors.surfaceVariant,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
            >
              <Ionicons
                name="person"
                size={48}
                color={colors.onSurfaceVariant}
              />
            </View>
          )}
          <Text
            style={{
              fontFamily: fontRegistryToUse.body,
              fontSize: fontSize.sm,
              color: colors.primary,
              marginTop: 8,
            }}
          >
            Tap to change profile picture
          </Text>
        </Pressable>

        {/* Personal Information Fields */}
        {renderInfoLine('Nickname', 'nickname', personalInfo.nickname)}
        {renderInfoLine('Full Name', 'fullName', personalInfo.fullName)}
        {renderInfoLine('Birth Date', 'birthDate', personalInfo.birthDate)}
        {renderInfoLine(
          'Phone Number',
          'phoneNumber',
          personalInfo.phoneNumber,
        )}
        {renderInfoLine('Address', 'address', personalInfo.address)}

        {/* Gender */}
        <Pressable
          onPress={() => setShowGenderModal(true)}
          style={{
            paddingHorizontal: spacing.layout.md,
            paddingVertical: spacing.layout.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.outline,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              fontFamily: fontRegistryToUse.body,
              fontSize: fontSize.xs,
              color: colors.onSurfaceVariant,
            }}
          >
            Gender
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.layout.sm,
            }}
          >
            <Text
              style={{
                fontFamily: fontRegistryToUse.body,
                fontSize: fontSize.xs,
                color: colors.onSurface,
              }}
            >
              {personalInfo.gender
                ? personalInfo.gender.charAt(0).toUpperCase() +
                  personalInfo.gender.slice(1)
                : 'Not set'}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.onSurfaceVariant}
            />
          </View>
        </Pressable>

        {/* Marital Status */}
        <Pressable
          onPress={() => setShowMaritalStatusModal(true)}
          style={{
            paddingHorizontal: spacing.layout.md,
            paddingVertical: spacing.layout.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.outline,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              fontFamily: fontRegistryToUse.body,
              fontSize: fontSize.xs,
              color: colors.onSurfaceVariant,
            }}
          >
            Marital Status
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.layout.sm,
            }}
          >
            <Text
              style={{
                fontFamily: fontRegistryToUse.body,
                fontSize: fontSize.xs,
                color: colors.onSurface,
              }}
            >
              {personalInfo.maritalStatus
                ? personalInfo.maritalStatus.charAt(0).toUpperCase() +
                  personalInfo.maritalStatus.slice(1)
                : 'Not set'}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.onSurfaceVariant}
            />
          </View>
        </Pressable>

        {/* Edit Modal */}
        <Modal
          visible={editingField !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setEditingField(null)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'flex-end',
            }}
          >
            <View
              style={[
                styles.editModal,
                {
                  backgroundColor: colors.surface,
                  paddingHorizontal: spacing.layout.md,
                },
              ]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: spacing.layout.md,
                }}
              >
                <Text
                  style={{
                    fontFamily: fontRegistryToUse.heading,
                    fontSize: fontSize.lg,
                    color: colors.onSurface,
                  }}
                >
                  Edit {editingField}
                </Text>
                <Pressable onPress={() => setEditingField(null)}>
                  <Ionicons name="close" size={24} color={colors.onSurface} />
                </Pressable>
              </View>

              {editingField === 'birthDate' ? (
                <View>
                  <Pressable
                    style={[
                      styles.dateButton,
                      {
                        borderColor: colors.outline,
                        backgroundColor: colors.background,
                      },
                    ]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text
                      style={{
                        fontFamily: fontRegistryToUse.body,
                        fontSize: fontSize.md,
                        color: colors.onSurface,
                      }}
                    >
                      {selectedDate.toLocaleDateString()}
                    </Text>
                  </Pressable>
                  {showDatePicker && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                    />
                  )}
                </View>
              ) : (
                <TextInput
                  value={editValue}
                  onChangeText={setEditValue}
                  placeholder={`Enter ${editingField}`}
                  style={[
                    styles.editInput,
                    { borderColor: colors.outline, color: colors.onSurface },
                  ]}
                  placeholderTextColor={colors.onSurfaceVariant}
                />
              )}

              <View
                style={{
                  flexDirection: 'row',
                  gap: spacing.layout.md,
                  marginTop: spacing.layout.lg,
                }}
              >
                <Pressable
                  style={[
                    styles.modalButton,
                    { backgroundColor: colors.surfaceVariant, flex: 1 },
                  ]}
                  onPress={() => setEditingField(null)}
                >
                  <Text
                    style={{
                      fontFamily: fontRegistryToUse.body,
                      fontSize: fontSize.md,
                      color: colors.onSurface,
                    }}
                  >
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.modalButton,
                    { backgroundColor: colors.primary, flex: 1 },
                  ]}
                  onPress={handleSaveField}
                >
                  <Text
                    style={{
                      fontFamily: fontRegistryToUse.body,
                      fontSize: fontSize.md,
                      color: colors.onPrimary,
                    }}
                  >
                    Save
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Gender Modal */}
        <Modal
          visible={showGenderModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowGenderModal(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Pressable
              style={{ flex: 1, width: '100%' }}
              onPress={() => setShowGenderModal(false)}
            />
            <View
              style={[
                styles.editModal,
                {
                  backgroundColor: colors.surface,
                  paddingHorizontal: spacing.layout.md,
                  width: '80%',
                  position: 'absolute',
                },
              ]}
            >
              <Text
                style={{
                  fontFamily: fontRegistryToUse.heading,
                  fontSize: fontSize.lg,
                  color: colors.onSurface,
                  marginBottom: spacing.layout.md,
                }}
              >
                Select Gender
              </Text>
              <View style={{ gap: spacing.layout.sm }}>
                {[
                  { label: 'Male', value: 'male' },
                  { label: 'Female', value: 'female' },
                  { label: 'Other', value: 'other' },
                ].map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      updatePersonalInfo({
                        gender: option.value as 'male' | 'female' | 'other',
                      });
                      setShowGenderModal(false);
                    }}
                    style={[
                      {
                        paddingVertical: spacing.layout.md,
                        paddingHorizontal: spacing.layout.md,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.outline,
                        backgroundColor:
                          personalInfo.gender === option.value
                            ? colors.primary
                            : colors.background,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontFamily: fontRegistryToUse.body,
                        fontSize: fontSize.md,
                        color:
                          personalInfo.gender === option.value
                            ? colors.onPrimary
                            : colors.onSurface,
                      }}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* Marital Status Modal */}
        <Modal
          visible={showMaritalStatusModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMaritalStatusModal(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Pressable
              style={{ flex: 1, width: '100%' }}
              onPress={() => setShowMaritalStatusModal(false)}
            />
            <View
              style={[
                styles.editModal,
                {
                  backgroundColor: colors.surface,
                  paddingHorizontal: spacing.layout.md,
                  width: '80%',
                  position: 'absolute',
                },
              ]}
            >
              <Text
                style={{
                  fontFamily: fontRegistryToUse.heading,
                  fontSize: fontSize.lg,
                  color: colors.onSurface,
                  marginBottom: spacing.layout.md,
                }}
              >
                Select Marital Status
              </Text>
              <View style={{ gap: spacing.layout.sm }}>
                {[
                  { label: 'Single', value: 'single' },
                  { label: 'Married', value: 'married' },
                  { label: 'Divorced', value: 'divorced' },
                  { label: 'Widowed', value: 'widowed' },
                ].map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      updatePersonalInfo({
                        maritalStatus: option.value as
                          | 'single'
                          | 'married'
                          | 'divorced'
                          | 'widowed',
                      });
                      setShowMaritalStatusModal(false);
                    }}
                    style={[
                      {
                        paddingVertical: spacing.layout.md,
                        paddingHorizontal: spacing.layout.md,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.outline,
                        backgroundColor:
                          personalInfo.maritalStatus === option.value
                            ? colors.primary
                            : colors.background,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontFamily: fontRegistryToUse.body,
                        fontSize: fontSize.md,
                        color:
                          personalInfo.maritalStatus === option.value
                            ? colors.onPrimary
                            : colors.onSurface,
                      }}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </FloatingHeader>
  );
}

const styles = StyleSheet.create({
  infoLine: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
