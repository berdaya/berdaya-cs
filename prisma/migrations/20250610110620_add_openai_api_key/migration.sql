-- CreateTable
CREATE TABLE "assistants" (
    "id" TEXT NOT NULL,
    "openai_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "tools" TEXT[],
    "temperature" DOUBLE PRECISION NOT NULL,
    "top_p" DOUBLE PRECISION NOT NULL,
    "responseFormat" JSONB NOT NULL,
    "file_ids" TEXT[],
    "openai_api_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assistants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "threads" (
    "id" TEXT NOT NULL,
    "openai_id" TEXT NOT NULL,
    "assistant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "threads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assistants_openai_id_key" ON "assistants"("openai_id");

-- CreateIndex
CREATE UNIQUE INDEX "threads_openai_id_key" ON "threads"("openai_id");

-- AddForeignKey
ALTER TABLE "threads" ADD CONSTRAINT "threads_assistant_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "assistants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
