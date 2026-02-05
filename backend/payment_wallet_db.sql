-- create database if not exists bloglaravel_database;
create database if not exists payment_wallet_db; 
use payment_wallet_db;

create table if not exists rols (
	id int primary key auto_increment,
	descripcion text not null,
	created_at timestamp default CURRENT_TIMESTAMP,
	updated_at timestamp default CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
	id int primary key auto_increment,
	id_rol int not null,
	nombre varchar(200) NOT NULL,
	username varchar(100) NOT NULL UNIQUE,
	account_number varchar(20) NOT NULL UNIQUE,
	primary_card_id int null,
	email varchar(100) NOT NULL UNIQUE,
	telefono varchar(30),
	password varchar(255) not null,
	saldo_actual double(13, 4),
	estado boolean not null,
	created_at timestamp default CURRENT_TIMESTAMP,
	updated_at timestamp default CURRENT_TIMESTAMP,
	foreign key (id_rol) references rols(id) on update cascade on delete cascade
); 

-- Roles base
INSERT IGNORE INTO rols (id, descripcion) VALUES
 (1, 'admin'),
 (2, 'cliente');

-- Usuario administrador por defecto
INSERT IGNORE INTO users (id_rol, nombre, username, account_number, email, telefono, password, saldo_actual, estado)
VALUES (1, 'Administrador', 'admin', '100000000000', 'admin@ewallet.com', '00000000', '$2b$10$c41cPLLZJUATKwIWGTtlTuurJu4yPUqLaSusEpqE/MlKL0UZJF0xG', 0, 1);

CREATE  TABLE IF NOT EXISTS  movements (
	id int primary key AUTO_INCREMENT,
	id_user int,
	tipo varchar(20),
	descripcion text,
	monto decimal(13,4),
	fecha timestamp default CURRENT_TIMESTAMP,
	created_at timestamp default CURRENT_TIMESTAMP,
	updated_at timestamp default CURRENT_TIMESTAMP,
	FOREIGN key(id_user) references users(id) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS transactions (
	id int primary key auto_increment,
	tipo varchar(20) not null,
	monto decimal(13,4) not NULL  default 0,
	referencia varchar(30) not null,
	estado varchar(20) not null,
	description text,
	bank_name varchar(80),
	card_type varchar(20),
	card_last4 varchar(4),
	origen varchar(80),
	destino varchar(120),
	fecha_transaction TIMESTAMP not null default current_timestamp,
	created_at timestamp not null default current_timestamp,
	updated_at timestamp not null default current_timestamp
);


CREATE TABLE IF NOT EXISTS user_transactions (
	id int primary key auto_increment,
	id_user int not null,
	id_transaction int not null,
	direction varchar(10) not null,
	foreign KEY (id_user) references users(id) on update cascade on delete cascade,
	foreign KEY (id_transaction) references transactions(id),
	created_at timestamp default current_timestamp,
	updated_at timestamp default current_timestamp
); 

CREATE TABLE IF NOT EXISTS debit_cards (
	id int primary key auto_increment,
	id_user int not null,
	last4 varchar(4) not null,
	brand varchar(30) not null,
	color varchar(30) not null default 'sky',
	estado boolean not null default 1,
	created_at timestamp default current_timestamp,
	updated_at timestamp default current_timestamp,
	foreign key (id_user) references users(id) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS scheduled_payments (
	id int primary key auto_increment,
	id_user int not null,
	service_name varchar(120) not null,
	account_number varchar(60) not null,
	amount decimal(13,4) not null,
	execution_date date not null,
	next_execution_date date null,
	frequency varchar(20) not null,
	status varchar(20) not null default 'scheduled',
	last_executed_at datetime null,
	cancelled_at datetime null,
	created_at timestamp default current_timestamp,
	updated_at timestamp default current_timestamp,
	foreign key (id_user) references users(id) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS payment_executions (
	id int primary key auto_increment,
	payment_id int not null,
	id_user int not null,
	service_name varchar(120) not null,
	account_number varchar(60) not null,
	amount decimal(13,4) not null,
	execution_date date not null,
	executed_at datetime not null,
	frequency varchar(20) not null,
	status varchar(20) not null default 'executed',
	created_at timestamp default current_timestamp,
	updated_at timestamp default current_timestamp,
	unique key uniq_payment_execution (payment_id, execution_date),
	foreign key (payment_id) references scheduled_payments(id) on update cascade on delete cascade,
	foreign key (id_user) references users(id) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS notifications (
	id int primary key auto_increment,
	id_user int not null,
	max_envio varchar(20) not null,
	max_retiro varchar(20) not null,
	fecha_actualization timestamp default current_timestamp,
	created_at timestamp default current_timestamp,
	updated_at timestamp default current_timestamp,
	foreign KEY (id_user) references users(id) on delete cascade on update cascade
);

CREATE TABLE IF NOT EXISTS audits (
	id int PRIMARY KEY auto_increment,
	id_user int not null,
	accion varchar(150) not null,
	ip varchar(20) not null,
	navegador varchar(50) not null,
	fecha_hora_evento timestamp default current_timestamp,
	created_at timestamp default current_timestamp,
	updated_at timestamp default current_timestamp,
	foreign key (id_user) references users(id) on update cascade on delete cascade
);

CREATE TABLE IF NOT EXISTS active_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(1000) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);