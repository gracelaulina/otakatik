import React, { useEffect, useRef, useState } from 'react'
import { Animated, Easing, ScrollView, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Screen from '../components/Screen'
import T from '../components/T'
import Mascot from '../components/Mascot'
import TopBar from '../components/TopBar'
import FadeInUp from '../components/FadeInUp'
import PressableScale from '../components/PressableScale'
import Button3D from '../components/Button3D'
import GuideModal, { GUIDE_STEPS } from '../components/GuideModal'
import { globalTabBarRef } from '../components/TabBar'
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
    const scrollRef = useRef(null)
    const targetRefs = useRef({})
    const [guideStep, setGuideStep] = useState(0)
    const [targetRect, setTargetRect] = useState(null)

    const guideVisible = !!state.hydrated && !state.seenGuide

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

    // Ukur posisi elemen secara presisi di layar setelah scroll selesai
    const measureStep = (idx) => {
        const key = GUIDE_STEPS[idx]?.key
        if (!key) return

        if (scrollRef.current) {
            if (key === 'actions') {
                scrollRef.current.scrollToEnd({ animated: true })
            } else if (key === 'main') {
                scrollRef.current.scrollTo({ y: 95, animated: true })
            } else {
                scrollRef.current.scrollTo({ y: 0, animated: true })
            }
        }

        setTimeout(() => {
            const ref = key === 'tabs' ? globalTabBarRef : targetRefs.current[key]
            if (ref && ref.measureInWindow) {
                ref.measureInWindow((x, y, w, h) => {
                    if (w > 0 && h > 0) {
                        setTargetRect({ x, y, w, h })
                    }
                })
            }
        }, 320)
    }

    useEffect(() => {
        if (guideVisible) {
            measureStep(guideStep)
        }
    }, [guideVisible, guideStep])

    const handleNextGuide = () => {
        if (guideStep < GUIDE_STEPS.length - 1) {
            setGuideStep(guideStep + 1)
        } else {
            setGuideStep(0)
            if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: true })
            dispatch({ type: 'SEEN_GUIDE' })
        }
    }

    const handleSkipGuide = () => {
        setGuideStep(0)
        if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: true })
        dispatch({ type: 'SEEN_GUIDE' })
    }

    const openGuideAgain = () => {
        setGuideStep(0)
        dispatch({ type: 'SHOW_GUIDE' })
    }

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
            <TopBar
                hearts={state.hearts}
                xp={state.xp}
                pillsRef={(el) => {
                    targetRefs.current.stats = el
                }}
            />

            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
            >
                {/* Sapaan + Tombol Panduan */}
                <FadeInUp>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 18,
                            marginTop: 4,
                        }}
                    >
                        <View>
                            <T weight="semi" style={{ fontSize: 18, opacity: 0.7 }}>
                                Halo,
                            </T>
                            <T weight="bold" style={{ fontSize: 40, lineHeight: 46 }}>
                                {name}!
                            </T>
                        </View>
                        <PressableScale
                            onPress={openGuideAgain}
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: 20,
                                paddingHorizontal: 14,
                                paddingVertical: 10,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                            }}
                        >
                            <Ionicons name="help-circle" size={22} color={colors.blue} />
                            <T weight="bold" style={{ fontSize: 14 }}>
                                Panduan
                            </T>
                        </PressableScale>
                    </View>
                </FadeInUp>

                {/* Kartu lanjutkan belajar */}
                <FadeInUp delay={80}>
                    <View
                        ref={(el) => {
                            targetRefs.current.resume = el
                        }}
                        collapsable={false}
                    >
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
                    </View>
                </FadeInUp>

                {/* Kartu maskot (elemen utama layar) */}
                <FadeInUp delay={160}>
                    <View
                        ref={(el) => {
                            targetRefs.current.main = el
                        }}
                        collapsable={false}
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
                <FadeInUp delay={240} style={{ marginTop: 16 }}>
                    <View
                        ref={(el) => {
                            targetRefs.current.actions = el
                        }}
                        collapsable={false}
                        style={{ flexDirection: 'row', gap: 14 }}
                    >
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
                    </View>
                </FadeInUp>
            </ScrollView>

            <GuideModal
                visible={guideVisible}
                targetRect={targetRect}
                stepIdx={guideStep}
                onNext={handleNextGuide}
                onSkip={handleSkipGuide}
            />
        </Screen>
    )
}
