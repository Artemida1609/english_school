-- Create RoomType enum if missing
DO $$ BEGIN
  CREATE TYPE "RoomType" AS ENUM ('PUBLIC', 'PRIVATE', 'GROUP');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Chat rooms table (may already exist)
CREATE TABLE IF NOT EXISTS "chat_rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "RoomType" NOT NULL DEFAULT 'GROUP',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id")
);

-- Messages table (may already exist)
CREATE TABLE IF NOT EXISTS "messages" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- Membership table
CREATE TABLE IF NOT EXISTS "chat_room_members" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_room_members_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "chat_room_members_room_id_user_id_key"
  ON "chat_room_members"("room_id", "user_id");

DO $$ BEGIN
  ALTER TABLE "chat_room_members"
    ADD CONSTRAINT "chat_room_members_room_id_fkey"
    FOREIGN KEY ("room_id") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "chat_room_members"
    ADD CONSTRAINT "chat_room_members_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "messages"
    ADD CONSTRAINT "messages_room_id_fkey"
    FOREIGN KEY ("room_id") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "messages"
    ADD CONSTRAINT "messages_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
