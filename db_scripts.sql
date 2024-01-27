-- Database: cinema_cash_desk_manager

-- DROP DATABASE IF EXISTS cinema_cash_desk_manager;

CREATE DATABASE cinema_cash_desk_manager
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Russian_Russia.1251'
    LC_CTYPE = 'Russian_Russia.1251'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

-- Table: public.booking

-- DROP TABLE IF EXISTS public.booking;

CREATE TABLE IF NOT EXISTS public.booking
(
    id uuid NOT NULL,
    customer_name character varying(200) COLLATE pg_catalog."default" NOT NULL,
    tickets_number integer NOT NULL DEFAULT 1,
    "position" integer,
    CONSTRAINT booking_id_key UNIQUE (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.booking
    OWNER to postgres;

REVOKE ALL ON TABLE public.booking FROM tm_admin;

GRANT ALL ON TABLE public.booking TO postgres;

GRANT DELETE, UPDATE, INSERT, SELECT ON TABLE public.booking TO tm_admin;

-- Table: public.hall

-- DROP TABLE IF EXISTS public.hall;

CREATE TABLE IF NOT EXISTS public.hall
(
    id uuid NOT NULL,
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    capacity integer NOT NULL,
    CONSTRAINT hall_id_key UNIQUE (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.hall
    OWNER to postgres;

REVOKE ALL ON TABLE public.hall FROM tm_admin;

GRANT ALL ON TABLE public.hall TO postgres;

GRANT DELETE, UPDATE, INSERT, SELECT ON TABLE public.hall TO tm_admin;

-- Table: public.movie

-- DROP TABLE IF EXISTS public.movie;

CREATE TABLE IF NOT EXISTS public.movie
(
    id uuid NOT NULL,
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    duration integer NOT NULL,
    CONSTRAINT movie_id_key UNIQUE (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.movie
    OWNER to postgres;

REVOKE ALL ON TABLE public.movie FROM tm_admin;

GRANT ALL ON TABLE public.movie TO postgres;

GRANT DELETE, UPDATE, INSERT, SELECT ON TABLE public.movie TO tm_admin;

-- Table: public.screening

-- DROP TABLE IF EXISTS public.screening;

CREATE TABLE IF NOT EXISTS public.screening
(
    id uuid NOT NULL,
    movie_id uuid NOT NULL,
    scr_date_time timestamp without time zone NOT NULL,
    hall_id uuid NOT NULL,
    bookings uuid[] DEFAULT '{}'::uuid[],
    CONSTRAINT screening_id_key UNIQUE (id),
    CONSTRAINT screening_hall_id_fkey FOREIGN KEY (hall_id)
        REFERENCES public.hall (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT screening_movie_id_fkey FOREIGN KEY (movie_id)
        REFERENCES public.movie (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.screening
    OWNER to postgres;

REVOKE ALL ON TABLE public.screening FROM tm_admin;

GRANT ALL ON TABLE public.screening TO postgres;

GRANT DELETE, UPDATE, INSERT, SELECT ON TABLE public.screening TO tm_admin;