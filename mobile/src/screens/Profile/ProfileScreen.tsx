import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { User, Mail, Shield, LogOut, ChevronRight, Bell, Moon, HelpCircle } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { coachService } from '../../services/coachService';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';

export function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const { data: myCoach } = useQuery({
    queryKey: ['my-coach'],
    queryFn: () => coachService.getMyCoach(),
    enabled: user?.role === 'client',
  });

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
            } catch {
              // Even if API logout fails, clear local session
            }
            logout();
          },
        },
      ]
    );
  };

  const renderMenuItem = (
    icon: React.ReactNode,
    label: string,
    subtitle?: string,
    onPress?: () => void,
    danger?: boolean
  ) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconContainer, danger && { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
        {icon}
      </View>
      <View style={styles.menuContent}>
        <Text style={[Typography.body, danger && { color: Colors.danger }]}>{label}</Text>
        {subtitle && <Text style={Typography.caption}>{subtitle}</Text>}
      </View>
      {!danger && <ChevronRight size={18} color={Colors.textMuted} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={[
            styles.roleBadge,
            user?.role === 'coach' ? styles.roleBadgeCoach : styles.roleBadgeClient,
          ]}>
            <Text style={styles.roleBadgeText}>
              {user?.role === 'coach' ? 'Coach' : 'Asesorado'}
            </Text>
          </View>
        </View>
        <Text style={Typography.h3}>{user?.name || 'Usuario'}</Text>
        <Text style={[Typography.bodySmall, { marginTop: Spacing.xs }]}>
          {user?.email || 'email@ejemplo.com'}
        </Text>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={[Typography.overline, { marginBottom: Spacing.md }]}>CUENTA</Text>
        <View style={styles.menuCard}>
          {renderMenuItem(
            <User size={20} color={Colors.primary} />,
            'Información Personal',
            'Nombre, email, teléfono'
          )}
          {renderMenuItem(
            <Shield size={20} color={Colors.success} />,
            'Seguridad',
            'Contraseña, autenticación'
          )}
        </View>
      </View>

      {/* My Coach Section - only for clients */}
      {user?.role === 'client' && (
        <View style={styles.section}>
          <Text style={[Typography.overline, { marginBottom: Spacing.md }]}>MI ENTRENADOR</Text>
          <View style={styles.coachCard}>
            <View style={styles.coachAvatar}>
              <Text style={styles.coachAvatarText}>
                {myCoach?.name?.charAt(0)?.toUpperCase() || 'C'}
              </Text>
            </View>
            <View style={styles.coachInfo}>
              <Text style={[Typography.body, { fontWeight: '600' }]}>
                {myCoach ? myCoach.name : 'Sin coach asignado'}
              </Text>
              <Text style={Typography.caption}>
                {myCoach ? myCoach.email : 'Espera a ser asignado'}
              </Text>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </View>
        </View>
      )}

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={[Typography.overline, { marginBottom: Spacing.md }]}>PREFERENCIAS</Text>
        <View style={styles.menuCard}>
          {renderMenuItem(
            <Bell size={20} color={Colors.warning} />,
            'Notificaciones',
            'Recordatorios y alertas'
          )}
          {renderMenuItem(
            <Moon size={20} color={Colors.purple} />,
            'Apariencia',
            'Tema oscuro activado'
          )}
          {renderMenuItem(
            <HelpCircle size={20} color={Colors.info} />,
            'Ayuda y Soporte',
            'FAQ, contacto'
          )}
        </View>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <View style={styles.menuCard}>
          {renderMenuItem(
            <LogOut size={20} color={Colors.danger} />,
            'Cerrar Sesión',
            undefined,
            handleLogout,
            true
          )}
        </View>
      </View>

      {/* App version */}
      <Text style={[Typography.caption, { textAlign: 'center', marginTop: Spacing.lg }]}>
        FitCoach Pro v1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    paddingBottom: Spacing['3xl'],
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    marginBottom: Spacing.base,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
  },
  roleBadge: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.bg,
  },
  roleBadgeCoach: {
    backgroundColor: Colors.warning,
  },
  roleBadgeClient: {
    backgroundColor: Colors.success,
  },
  roleBadgeText: {
    color: Colors.textInverse,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  section: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xl,
  },
  menuCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuContent: {
    flex: 1,
    gap: 2,
  },
  coachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
  },
  coachAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  coachAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  coachInfo: {
    flex: 1,
    gap: 2,
  },
});
