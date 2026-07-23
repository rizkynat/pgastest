--
-- PostgreSQL database dump
--

\restrict bcPakxcjKYglz7xCXcUD1pHbD1WcLuub4wr5pafqhb57RPE45gDCorb2obzHjUg

-- Dumped from database version 15.16
-- Dumped by pg_dump version 15.16

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'USER'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    department_id integer NOT NULL,
    department_name character varying(100) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_department_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.departments_department_id_seq OWNER TO postgres;

--
-- Name: departments_department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    employee_id integer NOT NULL,
    employee_name character varying(100) NOT NULL,
    department_id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: employees_employee_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employees_employee_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.employees_employee_id_seq OWNER TO postgres;

--
-- Name: employees_employee_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_employee_id_seq OWNED BY public.employees.employee_id;


--
-- Name: spendings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spendings (
    spending_id integer NOT NULL,
    employee_id integer NOT NULL,
    spending_date date NOT NULL,
    value numeric(12,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.spendings OWNER TO postgres;

--
-- Name: spendings_spending_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spendings_spending_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.spendings_spending_id_seq OWNER TO postgres;

--
-- Name: spendings_spending_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spendings_spending_id_seq OWNED BY public.spendings.spending_id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id uuid NOT NULL,
    full_name character varying(150) NOT NULL,
    email character varying(150) NOT NULL,
    number_phone text,
    nik text,
    photo text,
    password text NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    createdat timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    updatedat timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: departments department_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);


--
-- Name: employees employee_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN employee_id SET DEFAULT nextval('public.employees_employee_id_seq'::regclass);


--
-- Name: spendings spending_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spendings ALTER COLUMN spending_id SET DEFAULT nextval('public.spendings_spending_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
bbc28196-d925-41de-a5ac-c5ce1b1decbd	2dde910f2c50cd064ad5a672014d14a42ca39fe4449b59bd99b9b13f887d90d9	2026-07-23 11:59:53.004985+07	20260723045952_first	\N	\N	2026-07-23 11:59:52.967091+07	1
c44b991f-ea03-40b4-a920-74e5b4552fce	23744d0b8e5de893c962f40f4f99d799cc11ab399809eca282f5bf5d0f2eb11d	2026-07-23 12:13:16.392138+07	20260723051316_add_user_tbl	\N	\N	2026-07-23 12:13:16.207516+07	1
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (department_id, department_name, "createdAt", "updatedAt") FROM stdin;
2	Human Resources	2026-07-23 21:17:03.231	2026-07-23 21:17:03.231
3	Finance	2026-07-23 21:17:03.231	2026-07-23 21:17:03.231
4	Information Technology	2026-07-23 21:17:03.231	2026-07-23 21:17:03.231
5	Marketing	2026-07-23 21:17:03.231	2026-07-23 21:17:03.231
6	Operations	2026-07-23 21:17:03.231	2026-07-23 21:17:03.231
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (employee_id, employee_name, department_id, "createdAt", "updatedAt") FROM stdin;
21	John Doe	6	2026-07-23 21:23:21.881	2026-07-23 21:23:21.881
22	Jane Smith	6	2026-07-23 21:23:21.881	2026-07-23 21:23:21.881
23	Michael Johnson	2	2026-07-23 21:23:21.881	2026-07-23 21:23:21.881
24	Emily Davis	2	2026-07-23 21:23:21.881	2026-07-23 21:23:21.881
25	David Wilson	3	2026-07-23 21:23:21.881	2026-07-23 21:23:21.881
26	Sarah Brown	3	2026-07-23 21:23:21.881	2026-07-23 21:23:21.881
27	Daniel Miller	4	2026-07-23 21:23:21.881	2026-07-23 21:23:21.881
28	Jessica Taylor	4	2026-07-23 21:23:21.881	2026-07-23 21:23:21.881
29	Christopher Anderson	5	2026-07-23 21:23:21.881	2026-07-23 21:23:21.881
30	Amanda Thomas	5	2026-07-23 21:23:21.881	2026-07-23 21:23:21.881
31	dsdsd	4	2026-07-23 16:21:00.849	2026-07-23 16:21:00.849
\.


--
-- Data for Name: spendings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spendings (spending_id, employee_id, spending_date, value, "createdAt", "updatedAt") FROM stdin;
16	21	2025-01-10	250000.00	2026-07-23 21:25:51.967	2026-07-23 21:25:51.967
17	21	2025-01-20	150000.00	2026-07-23 21:25:51.967	2026-07-23 21:25:51.967
18	22	2025-02-05	500000.00	2026-07-23 21:25:51.967	2026-07-23 21:25:51.967
19	23	2025-02-10	320000.00	2026-07-23 21:25:51.967	2026-07-23 21:25:51.967
20	23	2025-03-01	275000.00	2026-07-23 21:25:51.967	2026-07-23 21:25:51.967
21	24	2025-03-15	450000.00	2026-07-23 21:25:51.967	2026-07-23 21:25:51.967
22	25	2025-04-12	600000.00	2026-07-23 21:25:51.967	2026-07-23 21:25:51.967
23	26	2025-04-18	125000.00	2026-07-23 21:25:51.967	2026-07-23 21:25:51.967
24	27	2025-05-05	700000.00	2026-07-23 21:25:51.967	2026-07-23 21:25:51.967
25	28	2025-05-15	215000.00	2026-07-23 21:25:51.967	2026-07-23 21:25:51.967
26	29	2025-06-01	180000.00	2026-07-23 21:25:51.967	2026-07-23 21:25:51.967
27	30	2025-06-20	350000.00	2026-07-23 21:25:51.967	2026-07-23 21:25:51.967
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, full_name, email, number_phone, nik, photo, password, role, is_active, createdat, updatedat) FROM stdin;
267b9383-c8cb-4fd3-b9d5-87a5105450d2	John Doe	user@example.com	081234567890	3283789273	\N	$2b$10$vXecS0mJIECnY29kNbUwe.pdnHysjxow7Od1MAVXt9t9A1u5YzLYC	USER	t	2026-07-23 05:46:04.347+07	2026-07-23 05:46:04.347+07
\.


--
-- Name: departments_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_department_id_seq', 6, true);


--
-- Name: employees_employee_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_employee_id_seq', 31, true);


--
-- Name: spendings_spending_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spendings_spending_id_seq', 27, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (employee_id);


--
-- Name: spendings spendings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spendings
    ADD CONSTRAINT spendings_pkey PRIMARY KEY (spending_id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: idx_user_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_email ON public."user" USING btree (email);


--
-- Name: user_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_email_key ON public."user" USING btree (email);


--
-- Name: employees employees_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(department_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: spendings spendings_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spendings
    ADD CONSTRAINT spendings_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(employee_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict bcPakxcjKYglz7xCXcUD1pHbD1WcLuub4wr5pafqhb57RPE45gDCorb2obzHjUg

