package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract 智能合约实现
type SmartContract struct {
	contractapi.Contract
}

// FoodAsset 食品溯源资产结构
type FoodAsset struct {
	ID           string    `json:"id"`           // 批次号
	Origin       string    `json:"origin"`       // 来源地
	SupplierName string    `json:"supplierName"` // 供应商名称
	CreateTime   time.Time `json:"createTime"`   // 上链时间
	Status       string    `json:"status"`       // 当前状态
	OwnerOrg     string    `json:"ownerOrg"`     // 当前持有者
	Details      string    `json:"details"`      // 额外详情
}

// HistoryQueryResult 历史查询返回结构
type HistoryQueryResult struct {
	Record    *FoodAsset `json:"record"`
	TxId      string     `json:"txId"`
	Timestamp time.Time  `json:"timestamp"`
	IsDelete  bool       `json:"isDelete"`
}

// InitLedger 初始化账本
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	log.Println("foodtrace chaincode is successfully instantiated")
	return nil
}

// CreateFood 创建食品批次
func (s *SmartContract) CreateFood(ctx contractapi.TransactionContextInterface, id string, origin string, details string) error {

	// 检查资产是否存在
	exists, err := s.AssetExists(ctx, id)
	if err != nil {
		return fmt.Errorf("检查资产是否存在时出错: %v", err)
	}
	if exists {
		return fmt.Errorf("资产 %s 已存在", id)
	}

	// 获取调用者 MSP ID
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("获取调用者 MSPID 失败: %v", err)
	}

	// 权限控制
	if clientMSPID != "SupplierMSP" {
		return fmt.Errorf("只有供应商 (SupplierMSP) 才能创建食品资产, 但调用者是 %s", clientMSPID)
	}

	// 获取交易时间戳
	txTimestamp, err := ctx.GetStub().GetTxTimestamp()
	if err != nil {
		return fmt.Errorf("获取交易时间戳失败: %v", err)
	}
	createTime := time.Unix(txTimestamp.Seconds, int64(txTimestamp.Nanos))

	// 组装资产对象
	asset := FoodAsset{
		ID:           id,
		Origin:       origin,
		SupplierName: "供应商A (模拟)",
		CreateTime:   createTime,
		Status:       "已生产",
		OwnerOrg:     clientMSPID,
		Details:      details,
	}

	// 序列化
	assetJSON, err := json.Marshal(asset)
	if err != nil {
		return fmt.Errorf("序列化资产失败: %v", err)
	}

	// 写入账本
	err = ctx.GetStub().PutState(id, assetJSON)
	if err != nil {
		return fmt.Errorf("写入账本失败: %v", err)
	}

	log.Printf("资产 %s 创建成功", id)
	return nil
}

// UpdateFoodStatus 更新食品状态
func (s *SmartContract) UpdateFoodStatus(ctx contractapi.TransactionContextInterface, id string, newStatus string, newDetails string) error {

	// 获取调用者 MSP ID
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("获取调用者 MSPID 失败: %v", err)
	}

	// 获取资产
	asset, err := s.QueryFood(ctx, id)
	if err != nil {
		return err
	}

	// 状态流转控制
	switch asset.Status {
	case "已生产":
		if clientMSPID != "ProcessorMSP" {
			return fmt.Errorf("当前状态 '已生产', 只有加工厂 (ProcessorMSP) 能更新, 但调用者是 %s", clientMSPID)
		}
		if newStatus != "加工中" {
			return fmt.Errorf("状态 '已生产' 只能变更为 '加工中', 而不是 '%s'", newStatus)
		}
	case "加工中":
		if clientMSPID != "LogisticsMSP" {
			return fmt.Errorf("当前状态 '加工中', 只有物流商 (LogisticsMSP) 能更新, 但调用者是 %s", clientMSPID)
		}
		if newStatus != "运输中" {
			return fmt.Errorf("状态 '加工中' 只能变更为 '运输中', 而不是 '%s'", newStatus)
		}
	case "运输中":
		if clientMSPID != "RetailerMSP" {
			return fmt.Errorf("当前状态 '运输中', 只有零售商 (RetailerMSP) 能更新, 但调用者是 %s", clientMSPID)
		}
		if newStatus != "已上架" {
			return fmt.Errorf("状态 '运输中' 只能变更为 '已上架', 而不是 '%s'", newStatus)
		}
	case "已上架":
		return fmt.Errorf("资产 %s 已是最终状态 '已上架', 无法更新", id)
	default:
		return fmt.Errorf("未知的资产状态: %s", asset.Status)
	}

	// 更新资产信息
	asset.Status = newStatus
	asset.OwnerOrg = clientMSPID
	asset.Details = newDetails

	// 序列化并写回账本
	assetJSON, err := json.Marshal(asset)
	if err != nil {
		return fmt.Errorf("序列化资产失败: %v", err)
	}

	err = ctx.GetStub().PutState(id, assetJSON)
	if err != nil {
		return fmt.Errorf("更新账本失败: %v", err)
	}

	log.Printf("资产 %s 状态更新为 '%s'", id, newStatus)
	return nil
}

// QueryFood 查询食品当前状态
func (s *SmartContract) QueryFood(ctx contractapi.TransactionContextInterface, id string) (*FoodAsset, error) {
	assetJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("读取世界状态失败: %v", err)
	}
	if assetJSON == nil {
		return nil, fmt.Errorf("资产 %s 不存在", id)
	}

	var asset FoodAsset
	err = json.Unmarshal(assetJSON, &asset)
	if err != nil {
		return nil, fmt.Errorf("反序列化资产失败: %v", err)
	}

	return &asset, nil
}

// GetFoodHistory 查询食品历史变更记录
func (s *SmartContract) GetFoodHistory(ctx contractapi.TransactionContextInterface, id string) ([]*HistoryQueryResult, error) {
	log.Printf("开始查询资产 %s 的历史记录", id)

	resultsIterator, err := ctx.GetStub().GetHistoryForKey(id)
	if err != nil {
		return nil, fmt.Errorf("获取历史记录失败: %v", err)
	}
	defer resultsIterator.Close()

	var records []*HistoryQueryResult

	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var asset FoodAsset
		if len(response.Value) > 0 {
			err = json.Unmarshal(response.Value, &asset)
			if err != nil {
				return nil, err
			}
		} else {
			asset = FoodAsset{ID: id}
		}

		record := &HistoryQueryResult{
			TxId:      response.TxId,
			Timestamp: response.Timestamp.AsTime(),
			Record:    &asset,
			IsDelete:  response.IsDelete,
		}
		records = append(records, record)
	}

	return records, nil
}

// AssetExists 检查资产是否存在
func (s *SmartContract) AssetExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	assetJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("检查资产是否存在时出错: %v", err)
	}
	return assetJSON != nil, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		log.Panicf("创建 foodtrace 链码失败: %v", err)
	}

	if err := chaincode.Start(); err != nil {
		log.Panicf("启动 foodtrace 链码失败: %v", err)
	}
}
