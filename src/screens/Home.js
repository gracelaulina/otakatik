import React, { useEffect, useRef } from 'react'
import { Animated, Easing, ScrollView, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Screen from '../components/Screen'
import T from '../components/T'
import Mascot from '../components/Mascot'
import TopBar from '../components/TopBar'
import FadeInUp from '../components/FadeInUp'
import PressableScale from '../components/PressableScale'
import Button3D from '../components/Button3D'
import { useNav } from '../navigation/NavContext'
import { useGame, getResume } from '../state/GameContext'
import { colors } from '../theme'

const SOFT_WHITE = 'rgba(255,255,255,0.55)'
const SOFT_NAVY = 'rgba(0,0,0,0.08)'

// Pil kecil penanda posisi belajar (Materi -> Kuis)
function StepPill({ label, icon, active }) {
    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: active ? colors.navy : SOFT_NAVY,
            }}
        >
            <Ionicons name={icon} size={14} color={active ? '#fff' : colors.navy} />
            <T weight="semi" style={{ fontSize: 14, color: active ? '#fff' : colors.navy }}>
                {label}
            </T>
        </View>
    )
}

// Tile aksi cepat dengan ikon
function ActionTile({ color, icon, title, subtitle, onPress }) {
    return (
        <PressableScale
            onPress={onPress}
            style={{
                backgroundColor: color,
                borderRadius: 30,
                padding: 20,
                minHeight: 150,
                justifyContent: 'space-between',
            }}
        >
            <View
                style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: SOFT_WHITE,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Ionicons name={icon} size={26} color={colors.navy} />
            </View>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                }}
            >
                <View style={{ flex: 1 }}>
                    <T weight="bold" style={{ fontSize: 22 }}>
                        {title}
                    </T>
                    <T weight="semi" style={{ fontSize: 15, marginTop: 2, opacity: 0.75 }}>
                        {subtitle}
                    </T>
                </View>
                <Ionicons name="chevron-forward" size={22} color={colors.navy} />
            </View>
        </PressableScale>
    )
}

export default function Home() {
    const nav = useNav()
    const { state, dispatch } = useGame()
    const { stage, step } = getResume(state)
    const pulse = useRef(new Animated.Value(1)).current

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, {
                    toValue: 1.08,
                    duration: 900,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(pulse, {
                    toValue: 1,
                    duration: 900,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        )
        loop.start()
        return () => loop.stop()
    }, [])

    // Maskot ikut "melayang" pelan dari animasi yang sama
    const float = pulse.interpolate({ inputRange: [1, 1.08], outputRange: [0, -8] })

    const resume = () => {
        dispatch({ type: 'SET_HEARTS', hearts: 3 })
        if (step === 'quiz') nav.push('Quiz', { stageId: stage.id })
        else nav.push('Materi', { stageId: stage.id, page: 0 })
    }

    const name = state.user ? state.user.name : 'Teman'

    return (
        <Screen padBottom={100}>
            <TopBar hearts={state.hearts} xp={state.xp} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
            >
                {/* Sapaan */}
                <FadeInUp>
                    <View style={{ marginBottom: 18, marginTop: 4 }}>
                        <T weight="semi" style={{ fontSize: 18, opacity: 0.7 }}>
                            Halo,
                        </T>
                        <T weight="bold" style={{ fontSize: 40, lineHeight: 46 }}>
                            {name}!
                        </T>
                    </View>
                </FadeInUp>

                {/* Kartu lanjutkan belajar */}
                <FadeInUp delay={80}>
                    <PressableScale
                        onPress={resume}
                        style={{
                            backgroundColor: colors.yellow,
                            borderRadius: 30,
                            padding: 20,
                            overflow: 'hidden',
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ flex: 1, paddingRight: 12 }}>
                                <T weight="semi" style={{ fontSize: 15, opacity: 0.7 }}>
                                    Lanjutkan belajar
                                </T>
                                <T weight="bold" style={{ fontSize: 24, marginTop: 2 }}>
                                    Stage {stage.id}: {stage.title}
                                </T>
                            </View>
                            <View
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 28,
                                    backgroundColor: colors.navy,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Ionicons
                                    name="play"
                                    size={26}
                                    color="#fff"
                                    style={{ marginLeft: 3 }}
                                />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                            <StepPill label="Materi" icon="book" active={step !== 'quiz'} />
                            <StepPill label="Kuis" icon="help-circle" active={step === 'quiz'} />
                        </View>
                    </PressableScale>
                </FadeInUp>

                {/* Kartu maskot (elemen utama layar) */}
                <FadeInUp delay={160}>
                    <View
                        style={{
                            backgroundColor: colors.sky,
                            borderRadius: 38,
                            paddingTop: 24,
                            paddingBottom: 28,
                            alignItems: 'center',
                            marginTop: 16,
                            overflow: 'hidden',
                        }}
                    >
                        {/* Dekorasi lingkaran */}
                        <View
                            style={{
                                position: 'absolute',
                                top: -50,
                                left: -40,
                                width: 150,
                                height: 150,
                                borderRadius: 75,
                                backgroundColor: SOFT_WHITE,
                            }}
                        />
                        <View
                            style={{
                                position: 'absolute',
                                bottom: -60,
                                right: -30,
                                width: 170,
                                height: 170,
                                borderRadius: 85,
                                backgroundColor: SOFT_WHITE,
                            }}
                        />
                        <View
                            style={{
                                position: 'absolute',
                                top: 40,
                                right: 28,
                                width: 22,
                                height: 22,
                                borderRadius: 11,
                                backgroundColor: colors.yellow,
                            }}
                        />
                        <View
                            style={{
                                position: 'absolute',
                                top: 100,
                                left: 26,
                                width: 14,
                                height: 14,
                                borderRadius: 7,
                                backgroundColor: colors.pink,
                            }}
                        />

                        <Animated.View style={{ transform: [{ translateY: float }] }}>
                            <Mascot size={160} />
                        </Animated.View>

                        <T
                            weight="bold"
                            style={{ fontSize: 26, marginTop: 12, textAlign: 'center' }}
                        >
                            Ayo Otak-Atik Kodemu!
                        </T>
                        <T
                            weight="semi"
                            style={{ fontSize: 16, marginTop: 2, marginBottom: 18, opacity: 0.7 }}
                        >
                            Pilih stage dan mulai petualanganmu
                        </T>

                        <Animated.View style={{ transform: [{ scale: pulse }] }}>
                            <Button3D
                                variant="navy"
                                radius={42}
                                depth={6}
                                onPress={() => nav.push('StageSelect')}
                                faceStyle={{ width: 84, height: 84, paddingVertical: 0 }}
                            >
                                <Ionicons
                                    name="play"
                                    size={36}
                                    color="#fff"
                                    style={{ marginLeft: 4 }}
                                />
                            </Button3D>
                        </Animated.View>
                    </View>
                </FadeInUp>

                {/* Aksi cepat */}
                <FadeInUp delay={240} style={{ flexDirection: 'row', gap: 14, marginTop: 16 }}>
                    <View style={{ flex: 1 }}>
                        <ActionTile
                            color={colors.pink}
                            icon="barbell"
                            title="Latihan"
                            subtitle="Ulangi konsep"
                            onPress={() => nav.push('Quiz', { practice: true })}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <ActionTile
                            color={colors.lavender}
                            icon="time"
                            title="Riwayat"
                            subtitle="Percobaanmu"
                            onPress={() => nav.push('History')}
                        />
                    </View>
                </FadeInUp>
            </ScrollView>
        </Screen>
    )
}
