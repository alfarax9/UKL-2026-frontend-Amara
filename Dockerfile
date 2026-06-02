# Tahap 1: Install dependencies (Deps)
FROM node:22-alpine AS deps
# Cek ketersediaan libc untuk Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Copy package file saja untuk memanfaatkan Docker cache
COPY package.json package-lock.json* ./
RUN npm install

# Tahap 2: Build aplikasi (Builder)
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Disable telemetry selama build
ENV NEXT_TELEMETRY_DISABLED 1

# Terima ARG dari Railway dan jadikan ENV agar Next.js bisa melihatnya saat build
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID

ARG NEXT_PUBLIC_ENABLE_GOOGLE_AUTH
ENV NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=$NEXT_PUBLIC_ENABLE_GOOGLE_AUTH

# Jalankan build Next.js (karena next.config.ts pakai output: standalone)
RUN npm run build

# Tahap 3: Production Server (Runner)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Tambahkan user non-root untuk keamanan
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy folder public jika ada file statis (seperti gambar)
COPY --from=builder /app/public ./public

# Setup folder cache dan beri akses ke user nextjs
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy build standalone dari builder phase
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
