alter table "public"."notifications" drop constraint "notifications_type_check";

alter table "public"."notifications" add constraint "notifications_type_check" CHECK (((type)::text = ANY ((ARRAY['like'::character varying, 'comment'::character varying, 'follow'::character varying])::text[]))) not valid;

alter table "public"."notifications" validate constraint "notifications_type_check";


