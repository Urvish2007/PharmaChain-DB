import psycopg2
import random
from faker import Faker
from datetime import timedelta, date, datetime

fake = Faker()

# Connect to PostgreSQL
conn = psycopg2.connect(
    host="localhost",
    database="pharmachain",
    user="postgres",
    password="1234"
)
conn.autocommit = False
cursor = conn.cursor()

try:
    cursor.execute("SET search_path TO pharma_manufacturing;")
    
    print("Seeding 2000 records per table...")
    
    # 1. Material_Master (2000)
    material_ids = []
    print("Generating Material_Master...")
    for i in range(2000):
        mat_id = f"MAT-{i+1000}"
        material_ids.append(mat_id)
        mat_name = fake.word().capitalize() + " " + random.choice(["API", "Excipient", "Coating"])
        mat_type = random.choice(["Active", "Inactive"])
        storage = random.choice(["2-8 C", "15-25 C", "Below -20 C"])
        shelf_life = random.randint(12, 60)
        thera = random.choice(["Cardiology", "Neurology", "Oncology", "Pain Management"])
        state = random.choice(["Solid", "Liquid", "Gas"])
        is_haz = random.choice([True, False])
        is_inf = random.choice([True, False])
        uom = random.choice(["kg", "L", "g"])
        reorder = random.randint(100, 5000)
        
        cursor.execute("""
            INSERT INTO Material_Master (Material_ID, Material_Name, Material_Type, Storage_Condition, Shelf_Life, Therapeutic_Category, Material_State, isHazardous, isInflammable, UOM, Reorder_Level)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (Material_ID) DO NOTHING
        """, (mat_id, mat_name, mat_type, storage, shelf_life, thera, state, is_haz, is_inf, uom, reorder))

    # 2. Account_Master (2000)
    account_nos_sup = []
    account_nos_dist = []
    print("Generating Account_Master...")
    for i in range(2000):
        acc_no = f"ACC-{i+1000}"
        acc_type = random.choice(["Supplier", "Distributor", "Hospital"])
        if acc_type == "Supplier":
            account_nos_sup.append(acc_no)
        else:
            account_nos_dist.append(acc_no)
        
        cursor.execute("""
            INSERT INTO Account_Master (Account_No, Account_Name, Phone_No, Address, Account_Type)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (Account_No) DO NOTHING
        """, (acc_no, fake.company(), fake.numerify("###-###-####"), fake.address()[:100], acc_type))
        
    if not account_nos_sup:
        account_nos_sup.append("ACC-SUP-0")
        cursor.execute("INSERT INTO Account_Master (Account_No, Account_Name, Phone_No, Address, Account_Type) VALUES (%s, %s, %s, %s, %s) ON CONFLICT DO NOTHING", ("ACC-SUP-0", "Def Sup", "123", "Add", "Supplier"))
    if not account_nos_dist:
        account_nos_dist.append("ACC-DIS-0")
        cursor.execute("INSERT INTO Account_Master (Account_No, Account_Name, Phone_No, Address, Account_Type) VALUES (%s, %s, %s, %s, %s) ON CONFLICT DO NOTHING", ("ACC-DIS-0", "Def Dist", "123", "Add", "Distributor"))

    # 3. Employee_Master (2000)
    emp_ids = []
    print("Generating Employee_Master...")
    for i in range(2000):
        emp_id = f"EMP-{i+1000}"
        emp_ids.append(emp_id)
        role = random.choice(["ADMIN", "QC_ANALYST", "WAREHOUSE_MANAGER", "PRODUCTION_SUPERVISOR", "AUDITOR"])
        cursor.execute("""
            INSERT INTO Employee_Master (Emp_ID, Emp_Name, Department, Role, Hire_Date)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (Emp_ID) DO NOTHING
        """, (emp_id, fake.name(), fake.job()[:30], role, fake.date_between(start_date='-5y', end_date='today')))

    # 4. Equipment_Master (2000)
    equip_ids = []
    print("Generating Equipment_Master...")
    for i in range(2000):
        eq_id = f"EQ-{i+1000}"
        equip_ids.append(eq_id)
        cursor.execute("""
            INSERT INTO Equipment_Master (Equipment_ID, Equipment_Name, Equipment_Type, Last_Calibration_Date, Status)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (Equipment_ID) DO NOTHING
        """, (eq_id, fake.word() + " Machine", random.choice(["Mixer", "Compressor", "Packager"]), fake.date_between(start_date='-1y', end_date='today'), random.choice(["Active", "Maintenance"])))

    # 5. Product_Master (2000)
    product_ids = []
    print("Generating Product_Master...")
    for i in range(2000):
        prod_id = f"PRD-{i+1000}"
        product_ids.append(prod_id)
        cursor.execute("""
            INSERT INTO Product_Master (Product_ID, Product_Name, Generic_Name, Product_Type, Packing_Type, Packing_Size, SalableorSample, GenericorBranded)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (Product_ID) DO NOTHING
        """, (prod_id, fake.word()[:20].capitalize(), fake.word()[:100].capitalize(), random.choice(["Tablet", "Capsule", "Syrup"]), random.choice(["Blister", "Bottle"]), random.choice(["10s", "30s", "100s"])[:5], random.choice(["M", "S"]), random.choice(["G", "B"])))

    # 6. Transactions (2000 - split buy/sell)
    invoices_buy = []
    invoices_sell = []
    print("Generating Transactions...")
    for i in range(2000):
        inv = i + 100000
        t_type = "buy" if i % 2 == 0 else "sell"
        acc = random.choice(account_nos_sup) if t_type == "buy" else random.choice(account_nos_dist)
        if t_type == "buy": invoices_buy.append(inv)
        else: invoices_sell.append(inv)
        
        cursor.execute("""
            INSERT INTO Transactions (Invoice_No, Transaction_Date, Currency, Transaction_Type, Paid_Received, Account_No, Total_Value)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (Invoice_No) DO NOTHING
        """, (inv, fake.date_between(start_date='-2y', end_date='today'), "USD", t_type, fake.boolean(), acc, round(random.uniform(100.0, 50000.0), 2)))

    # 7. Supplier_Contract (2000)
    print("Generating Supplier_Contract...")
    for i in range(2000):
        cursor.execute("""
            INSERT INTO Supplier_Contract (Contract_ID, Account_No, Material_ID, Agreed_Price, Valid_Until)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (Contract_ID) DO NOTHING
        """, (f"CTR-{i+1000}", random.choice(account_nos_sup), random.choice(material_ids), round(random.uniform(10.0, 1000.0), 2), fake.date_between(start_date='today', end_date='+2y')))

    # 8. Warehouse (2000)
    print("Generating Warehouse...")
    cursor.execute("SELECT setval(pg_get_serial_sequence('Warehouse', 'item_id'), coalesce(max(item_id),0) + 1, false) FROM Warehouse;")
    warehouse_item_ids = []
    for i in range(2000):
        # We need a unique combination of Material_ID and Invoice_No for unique constraint
        mat_id = material_ids[i % len(material_ids)]
        inv_no = invoices_buy[i % len(invoices_buy)]
        
        # Avoid duplicate (Material_ID, Invoice_No) by ensuring 1:1 mapping in this fake loop
        cursor.execute("""
            INSERT INTO Warehouse (Material_ID, Invoice_No, UT_Q_A, Stock)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (Material_ID, Invoice_No) DO NOTHING
            RETURNING Item_ID
        """, (mat_id, inv_no, random.choice(['UT', 'QA', 'A', 'R', 'QU']), random.randint(100, 10000)))
        res = cursor.fetchone()
        if res:
            warehouse_item_ids.append(res[0])
            
    # Need to fetch item IDs in case of conflicts skipping returning
    if len(warehouse_item_ids) < 2000:
        cursor.execute("SELECT Item_ID FROM Warehouse LIMIT 2000")
        warehouse_item_ids = [row[0] for row in cursor.fetchall()]

    # 9. RM_Transaction (2000)
    print("Generating RM_Transaction...")
    for i, w_item in enumerate(warehouse_item_ids[:2000]):
        inv_no = invoices_buy[i % len(invoices_buy)]
        cursor.execute("""
            INSERT INTO RM_Transaction (Invoice_No, Item_ID, RM_Qty, Val)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (Invoice_No, Item_ID) DO NOTHING
        """, (inv_no, w_item, random.randint(10, 5000), round(random.uniform(50.0, 5000.0), 2)))

    # 10. Formula_Master (2000)
    print("Generating Formula_Master...")
    for i in range(2000):
        p_id = product_ids[i % len(product_ids)]
        m_id = material_ids[(i + 1) % len(material_ids)]
        cursor.execute("""
            INSERT INTO Formula_Master (Product_ID, Material_ID, Weight_per_tablet)
            VALUES (%s, %s, %s)
            ON CONFLICT (Product_ID, Material_ID) DO NOTHING
        """, (p_id, m_id, random.randint(1, 500)))

    # 11. Batch (2000)
    batches = []
    print("Generating Batch...")
    for i in range(2000):
        b_no = i + 200000
        batches.append(b_no)
        mfg = fake.date_between(start_date='-1y', end_date='-1d')
        exp = mfg + timedelta(days=random.randint(365, 1095))
        cursor.execute("""
            INSERT INTO Batch (Batch_No, Batch_Size, Mfg_Date, Exp_Date, Product_ID, Stock_Qty, UT_Q_A, Yield_Percentage)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (Batch_No) DO NOTHING
        """, (b_no, random.randint(1000, 50000), mfg, exp, random.choice(product_ids), random.randint(0, 50000), 'A', round(random.uniform(90.0, 100.0), 2)))

    # 12. Material_Dispensing (2000)
    print("Generating Material_Dispensing...")
    for i in range(2000):
        b_no = batches[i % len(batches)]
        w_id = warehouse_item_ids[i % len(warehouse_item_ids)]
        cursor.execute("""
            INSERT INTO Material_Dispensing (Batch_No, Item_ID, Quantity_Issued)
            VALUES (%s, %s, %s)
            ON CONFLICT (Batch_No, Item_ID) DO NOTHING
        """, (b_no, w_id, random.randint(1, 5)))

    # 13. Production_Log (2000)
    print("Generating Production_Log...")
    cursor.execute("SELECT setval(pg_get_serial_sequence('Production_Log', 'log_id'), coalesce(max(log_id),0) + 1, false) FROM Production_Log;")
    for i in range(2000):
        start = fake.date_time_between(start_date='-1y', end_date='now')
        end = start + timedelta(hours=random.randint(1, 24))
        cursor.execute("""
            INSERT INTO Production_Log (Batch_No, Equipment_ID, Emp_ID, Process_Stage, Start_Time, End_Time)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (random.choice(batches), random.choice(equip_ids), random.choice(emp_ids), random.choice(["Granulation", "Compression", "Coating", "Packaging"]), start, end))

    # 14. Product_Quality_Check (2000)
    print("Generating Product_Quality_Check...")
    for i, b_no in enumerate(batches[:2000]):
        cursor.execute("""
            INSERT INTO Product_Quality_Check (Report_ID, Batch_No, Analysis_Date, Analyst_Name, Sample_Size, Process_State, Test, Limits, Results, Emp_ID)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (Report_ID) DO NOTHING
        """, (f"PQC-{i+1000}", b_no, fake.date_between(start_date='-1y', end_date='today'), fake.first_name(), random.randint(10, 100), "Finished", "Assay", "95-105%", random.choice(["99%", "100%", "98%"]), random.choice(emp_ids)))

    # 15. FG_Transaction (2000)
    print("Generating FG_Transaction...")
    for i, b_no in enumerate(batches[:2000]):
        inv_no = invoices_sell[i % len(invoices_sell)]
        cursor.execute("""
            INSERT INTO FG_Transaction (Invoice_No, Batch_No, Sale_Qty, Val)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (Invoice_No, Batch_No) DO NOTHING
        """, (inv_no, b_no, random.randint(1, 5), round(random.uniform(100.0, 10000.0), 2)))

    # 16. Product_Recall (2000)
    print("Generating Product_Recall...")
    for i in range(2000):
        cursor.execute("""
            INSERT INTO Product_Recall (Recall_ID, Batch_No, Date_Initiated, Reason, Qty_Recalled)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (Recall_ID) DO NOTHING
        """, (f"REC-{i+1000}", random.choice(batches), fake.date_between(start_date='-1y', end_date='today'), fake.sentence(), random.randint(100, 5000)))

    # 17. Maintenance_Log (2000)
    print("Generating Maintenance_Log...")
    for i in range(2000):
        cursor.execute("""
            INSERT INTO Maintenance_Log (Maintenance_ID, Equipment_ID, Emp_ID, Maintenance_Date, Cost)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (Maintenance_ID) DO NOTHING
        """, (f"MN-{i+1000}", random.choice(equip_ids), random.choice(emp_ids), fake.date_between(start_date='-1y', end_date='today'), round(random.uniform(50.0, 5000.0), 2)))

    conn.commit()
    print("Successfully seeded 2000 records into all tables!")

except Exception as e:
    conn.rollback()
    print(f"Error during seeding: {e}")
finally:
    cursor.close()
    conn.close()
