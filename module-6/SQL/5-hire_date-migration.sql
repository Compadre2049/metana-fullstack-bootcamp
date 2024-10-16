-- create a backup of the table
CREATE TABLE schema_1.Employee_backup (
  employee_id INTEGER PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  department_id INTEGER,
  hire_date TIMESTAMP
);

INSERT INTO schema_1.Employee_backup (employee_id, first_name, last_name, department_id)
SELECT employee_id, first_name, last_name, department_id
FROM schema_1.Employee;

-- add the new hire_date column to the Employee table
ALTER TABLE schema_1.Employee
ADD COLUMN hire_date TIMESTAMP;

-- update the hire_date column with data from the Employee_backup table
UPDATE schema_1.Employee e
SET hire_date = (SELECT hire_date FROM schema_1.Employee_backup eb
                 WHERE eb.employee_id = e.employee_id);

-- drop the Employee_backup table
DROP TABLE schema_1.Employee_backup;