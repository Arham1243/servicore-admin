<script setup>
import { onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore, useGlobalStore, useSessionStore } from '@/stores';
import { RecaptchaV2 } from 'vue3-recaptcha-v2';
import { getDeviceFingerprint, getDeviceInfo } from '@/utils/deviceFingerprint';

const router = useRouter();
const authStore = useAuthStore();
const globalStore = useGlobalStore();
const sessionStore = useSessionStore();

const loading = ref(false);
const credentials = ref({
    email: '',
    password: '',
    remember_me: false
});

const showEula = ref(false);
const showPrivacy = ref(false);

onBeforeMount(() => {
    globalStore.clearErrors();
});

const login = async () => {
    if (!recaptchaToken.value) {
        globalStore.showError('reCAPTCHA', 'Please complete the reCAPTCHA');
        return;
    }

    try {
        loading.value = true;

        // Get device fingerprint and info
        const deviceFingerprint = getDeviceFingerprint();
        const deviceInfo = getDeviceInfo();

        const payload = {
            ...credentials.value,
            device_fingerprint: deviceFingerprint,
            device_info: deviceInfo
        };

        const response = await authStore.login(payload);

        // Check if OTP verification is required
        if (response?.challenge === 'OTP_REQUIRED') {
            // Store email for OTP verification screen
            sessionStore.setEmail(credentials.value.email);

            // Navigate to OTP verification with session token
            router.push({
                name: 'CodeVerification',
                query: {
                    session: response.session
                }
            });
            return;
        }

        const url = 'Dashboard';
        router.push(url);
    } catch (e) {
        // Other errors are handled by globalStore
    } finally {
        loading.value = false;
    }
};

// recaptcha
const recaptchaToken = ref('');
const handleErrorCallback = () => {
    globalStore.showError(
        'reCAPTCHA',
        'Captcha failed to load. Please refresh.'
    );
};
const handleExpiredCallback = () => {
    recaptchaToken.value = '';
    globalStore.showError('reCAPTCHA', 'Captcha expired, Please refresh.');
};
const handleLoadCallback = (token) => {
    recaptchaToken.value = token;
};
</script>

<template>
    <div>
        <h4 class="text-3xl font-bold text-center mb-12">Login</h4>
        <form @submit.prevent="login">
            <div class="grid">
                <div class="mb-6 col-span-12">
                    <label class="block mb-2" for="email"> Email </label>
                    <InputField
                        variant="text"
                        id="email"
                        v-model="credentials.email"
                        class="w-full"
                    />
                </div>

                <div class="mb-4 col-span-12">
                    <label class="block mb-2" for="password"> Password </label>
                    <InputField
                        id="password"
                        variant="password"
                        v-model="credentials.password"
                        class="w-full"
                        inputClass="w-full"
                        toggleMask
                        :feedback="false"
                    />
                </div>
            </div>

            <div class="flex justify-between items-center pt-1">
                <div class="flex items-center">
                    <InputField
                        variant="checkbox"
                        v-model="credentials.remember_me"
                        binary
                        inputId="remember"
                    />
                    <label for="remember" class="ml-2 cursor-pointer">
                        Remember me
                    </label>
                </div>
                <router-link
                    class="primary-text"
                    :to="{ name: 'Password Reset Request' }"
                >
                    Forgot Password
                </router-link>
            </div>
            <div class="pt-7 pb-5">
                <RecaptchaV2
                    @error-callback="handleErrorCallback"
                    @expired-callback="handleExpiredCallback"
                    @load-callback="handleLoadCallback"
                />
            </div>

            <Button
                class="w-full left-loading"
                label="Login"
                :disabled="loading || !recaptchaToken"
                :loading="loading"
                type="submit"
            />
        </form>
    </div>
</template>
