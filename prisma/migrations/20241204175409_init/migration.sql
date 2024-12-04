-- AlterTable
CREATE SEQUENCE section_id_seq;
ALTER TABLE "Section" ALTER COLUMN "id" SET DEFAULT nextval('section_id_seq');
ALTER SEQUENCE section_id_seq OWNED BY "Section"."id";
